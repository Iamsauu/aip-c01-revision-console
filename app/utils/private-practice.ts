import type {
  AnswerChoice,
  PrivatePracticeBank,
  Question,
  Source,
} from "../types";

type ImportableFile = {
  name: string;
  text: () => Promise<string>;
};

type UdemyAnswer = {
  text: string;
  is_correct: boolean;
};

type UdemyQuestion = {
  question_number: number;
  question: string;
  answers: UdemyAnswer[];
};

type AnswerExplanation = {
  answer: string;
  explanation: string;
};

type QuestionExplanation = {
  question_number: number;
  answer_explanations: AnswerExplanation[];
  overall_explanation: string;
  references: Source[];
};

type ExplanationPayload = {
  practice_exam_1?: QuestionExplanation[];
  practice_exam_2?: QuestionExplanation[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isUdemyAnswer(value: unknown): value is UdemyAnswer {
  return (
    isRecord(value) &&
    typeof value.text === "string" &&
    typeof value.is_correct === "boolean"
  );
}

function isUdemyQuestion(value: unknown): value is UdemyQuestion {
  return (
    isRecord(value) &&
    Number.isInteger(value.question_number) &&
    typeof value.question === "string" &&
    Array.isArray(value.answers) &&
    value.answers.length >= 2 &&
    value.answers.every(isUdemyAnswer)
  );
}

function isQuestionExplanation(value: unknown): value is QuestionExplanation {
  return (
    isRecord(value) &&
    Number.isInteger(value.question_number) &&
    Array.isArray(value.answer_explanations) &&
    typeof value.overall_explanation === "string" &&
    Array.isArray(value.references)
  );
}

function isExplanationPayload(value: unknown): value is ExplanationPayload {
  if (!isRecord(value)) return false;
  const examOne = value.practice_exam_1;
  const examTwo = value.practice_exam_2;
  return (
    (Array.isArray(examOne) && examOne.every(isQuestionExplanation)) ||
    (Array.isArray(examTwo) && examTwo.every(isQuestionExplanation))
  );
}

function examNumberFromFileName(name: string) {
  const match = name.match(/practice[-_\s]*exam[-_\s]*([12])/i);
  return match ? Number(match[1]) : null;
}

function fallbackRationale(isCorrect: boolean) {
  return isCorrect
    ? "This option is marked correct in the imported practice file."
    : "This option is marked incorrect in the imported practice file.";
}

function mapQuestion(
  question: UdemyQuestion,
  examNumber: number,
  explanation?: QuestionExplanation,
): Question {
  const questionId = `udemy-exam-${examNumber}-q${String(
    question.question_number,
  ).padStart(3, "0")}`;
  const rationaleByAnswer = new Map(
    explanation?.answer_explanations.map((item) => [
      item.answer,
      item.explanation,
    ]) ?? [],
  );
  const choices: AnswerChoice[] = question.answers.map((answer, index) => ({
    id: `${questionId}-a${index + 1}`,
    text: answer.text,
    rationale:
      rationaleByAnswer.get(answer.text) ??
      fallbackRationale(answer.is_correct),
  }));

  return {
    id: questionId,
    type:
      question.answers.filter((answer) => answer.is_correct).length > 1
        ? "multiple"
        : "single",
    mode: "scenario",
    prompt: question.question,
    choices,
    correct_answer_ids: question.answers.flatMap((answer, index) =>
      answer.is_correct ? [`${questionId}-a${index + 1}`] : [],
    ),
    explanation:
      explanation?.overall_explanation ??
      "Answer status comes directly from the imported private practice file.",
    domain_ids: [],
    topic_ids: [],
    service_ids: [],
    importance: "Important",
    sources:
      explanation?.references.map((reference) => ({
        ...reference,
        publisher: reference.publisher ?? "AWS",
      })) ?? [],
    private_import: true,
    practice_section_id: `udemy-exam-${examNumber}`,
    practice_section_label: `Practice Exam ${examNumber}`,
    question_number: question.question_number,
  };
}

export async function createPrivatePracticeBank(
  files: ImportableFile[],
): Promise<PrivatePracticeBank> {
  if (!files.length) {
    throw new Error("Choose at least one Udemy practice JSON file.");
  }

  const parsedFiles = await Promise.all(
    files.map(async (file) => {
      try {
        return { name: file.name, payload: JSON.parse(await file.text()) };
      } catch {
        throw new Error(`${file.name} is not valid JSON.`);
      }
    }),
  );

  const explanationPayload = parsedFiles
    .map((file) => file.payload)
    .find(isExplanationPayload);
  const examPayloads = parsedFiles.flatMap((file) => {
    if (!Array.isArray(file.payload) || !file.payload.every(isUdemyQuestion)) {
      return [];
    }
    const examNumber = examNumberFromFileName(file.name);
    if (!examNumber) {
      throw new Error(
        `Could not identify Exam 1 or Exam 2 from the filename ${file.name}.`,
      );
    }
    return [{ examNumber, questions: file.payload }];
  });

  if (!examPayloads.length) {
    throw new Error(
      "No supported Udemy question-answer file was found in the selection.",
    );
  }

  const seenExams = new Set<number>();
  const questions = examPayloads.flatMap(({ examNumber, questions: exam }) => {
    if (seenExams.has(examNumber)) {
      throw new Error(`Practice Exam ${examNumber} was selected more than once.`);
    }
    seenExams.add(examNumber);
    const explanations =
      explanationPayload?.[
        examNumber === 1 ? "practice_exam_1" : "practice_exam_2"
      ] ?? [];
    const explanationByNumber = new Map(
      explanations.map((item) => [item.question_number, item]),
    );
    return exam
      .slice()
      .sort((a, b) => a.question_number - b.question_number)
      .map((question) =>
        mapQuestion(
          question,
          examNumber,
          explanationByNumber.get(question.question_number),
        ),
      );
  });

  const sections = [...seenExams]
    .sort()
    .map((examNumber) => ({
      id: `udemy-exam-${examNumber}`,
      label: `Practice Exam ${examNumber}`,
      question_count: questions.filter(
        (question) =>
          question.practice_section_id === `udemy-exam-${examNumber}`,
      ).length,
    }));

  return {
    schema_version: 1,
    imported_at: new Date().toISOString(),
    source_label: "Private Udemy practice import",
    explanations_loaded: Boolean(explanationPayload),
    sections,
    questions,
  };
}

export function isPrivatePracticeBank(
  value: unknown,
): value is PrivatePracticeBank {
  return (
    isRecord(value) &&
    value.schema_version === 1 &&
    typeof value.imported_at === "string" &&
    typeof value.source_label === "string" &&
    typeof value.explanations_loaded === "boolean" &&
    Array.isArray(value.sections) &&
    Array.isArray(value.questions) &&
    value.questions.every(
      (question) =>
        isRecord(question) &&
        typeof question.id === "string" &&
        typeof question.prompt === "string" &&
        question.private_import === true &&
        Array.isArray(question.choices) &&
        Array.isArray(question.correct_answer_ids),
    )
  );
}
