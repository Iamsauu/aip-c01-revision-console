import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataRoot = new URL("../public/data/", import.meta.url);

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, dataRoot), "utf8"));
}

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the revision console entry state", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>AIP-C01 Revision Console<\/title>/i);
  assert.match(html, /Loading source-backed JSON/);
  assert.match(html, /Preparing your revision console/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("JSON content represents the full published scope snapshot", async () => {
  const [
    certification,
    domainsPayload,
    topicsPayload,
    servicesPayload,
    serviceDetailsPayload,
    questionsPayload,
    labsPayload,
  ] = await Promise.all([
      readJson("certification.json"),
      readJson("domains.json"),
      readJson("topics.json"),
      readJson("services.json"),
      readJson("service-details.json"),
      readJson("questions.json"),
      readJson("labs.json"),
    ]);

  const domains = domainsPayload.items;
  const topics = topicsPayload.items;
  const services = servicesPayload.items;
  const serviceDetails = serviceDetailsPayload.items;
  const questions = questionsPayload.items;
  const labs = labsPayload.items;
  const tasks = domains.flatMap((domain) => domain.tasks);
  const skills = tasks.flatMap((task) => task.skills);

  assert.equal(domains.length, 5);
  assert.equal(tasks.length, 20);
  assert.equal(skills.length, 98);
  assert.equal(topics.length, 12);
  assert.equal(services.length, 112);
  assert.equal(serviceDetails.length, 112);
  assert.equal(labs.length, 6);
  assert.deepEqual(certification.coverage, {
    domains: 5,
    tasks: 20,
    skills: 98,
    scope_entries: 112,
  });

  for (const item of [...domains, ...skills, ...topics, ...services, ...labs]) {
    assert.ok(item.id, "Every record needs a stable ID");
    assert.ok(item.sources?.length, `${item.id} needs a structured source`);
    for (const source of item.sources) {
      assert.match(
        source.url,
        /^https:\/\/(?:docs\.)?aws\.amazon\.com\//,
        `${item.id} must reference official AWS documentation`,
      );
    }
  }

  for (const service of serviceDetails) {
    assert.ok(service.exam_patterns.length >= 1, `${service.id} lacks patterns`);
    assert.ok(service.strengths.length >= 1, `${service.id} lacks strengths`);
    assert.ok(
      service.elimination_signals.length >= 2,
      `${service.id} lacks conditional elimination signals`,
    );
    assert.ok(
      service.trigger_keywords.length >= 3,
      `${service.id} lacks trigger keywords`,
    );
    assert.ok(service.standout_feature, `${service.id} lacks a differentiator`);
    assert.ok(
      service.distinction_notes.length >= 1,
      `${service.id} lacks distinction notes`,
    );
  }

  const serviceIds = new Set(serviceDetails.map((service) => service.id));
  const questionIds = new Set(questions.map((question) => question.id));
  for (const service of serviceDetails) {
    for (const target of service.confusion_targets) {
      assert.ok(
        target.id && serviceIds.has(target.id),
        `${service.id} links to an unknown comparison target`,
      );
    }
    for (const related of service.commonly_paired_with) {
      assert.ok(
        serviceIds.has(related.id),
        `${service.id} links to an unknown paired service`,
      );
    }
    for (const question of service.related_questions) {
      assert.ok(
        questionIds.has(question.id),
        `${service.id} links to an unknown practice question`,
      );
    }
  }
});

test("services catalog and detail routes render as separate pages", async () => {
  const catalogResponse = await render("/services");
  assert.equal(catalogResponse.status, 200);
  const catalogHtml = await catalogResponse.text();
  assert.match(
    catalogHtml,
    /Match scenario constraints to the right AWS service/,
  );
  assert.match(catalogHtml, /Bedrock Guardrails/);
  assert.doesNotMatch(catalogHtml, /[\u0102\u0110\u0128\u0168\u01A0\u01AF\u1EA0-\u1EF9]/u);

  const detailResponse = await render("/services/service-bedrock-guardrails");
  assert.equal(detailResponse.status, 200);
  const detailHtml = await detailResponse.text();
  assert.match(detailHtml, /<title>Bedrock Guardrails \| AIP-C01 Revision Console<\/title>/i);
  assert.match(detailHtml, /When should you rule it out/);
  assert.match(detailHtml, /prompt attack detection/);
  assert.match(detailHtml, /aria-label="Adjacent services navigation"/);
  assert.match(detailHtml, /opens in a new tab/);
  assert.match(detailHtml, /rel="noopener noreferrer"/);
  assert.doesNotMatch(detailHtml, /[\u0102\u0110\u0128\u0168\u01A0\u01AF\u1EA0-\u1EF9]/u);
  for (const anchor of detailHtml.matchAll(/<a\b[^>]*>/g)) {
    assert.match(anchor[0], /\shref="[^"]+"/);
  }

  const missingResponse = await render("/services/service-does-not-exist");
  assert.equal(missingResponse.status, 404);
});

test("practice JSON is original, source-backed, and MCQ-ready", async () => {
  const payload = await readJson("questions.json");
  const questions = payload.items;
  assert.equal(questions.length, 24);
  assert.equal(
    questions.filter((question) => question.type === "multiple").length,
    6,
  );

  for (const question of questions) {
    assert.ok(question.prompt);
    assert.ok(question.choices.length >= 4);
    assert.ok(question.correct_answer_ids.length >= 1);
    assert.ok(question.sources.length >= 1);

    const choiceIds = new Set(question.choices.map((choice) => choice.id));
    for (const choice of question.choices) {
      assert.ok(choice.rationale, `${question.id} has a rationale gap`);
    }
    for (const answerId of question.correct_answer_ids) {
      assert.ok(choiceIds.has(answerId), `${question.id} has an invalid answer`);
    }
  }

  const serialized = JSON.stringify(questions);
  assert.doesNotMatch(serialized, /was_selected|udemy/i);
  assert.doesNotMatch(serialized, /[\u2013\u2014]/u);
});

test("learner state is JSON-backed and portable", async () => {
  const source = await readFile(
    new URL("../app/components/RevisionConsole.tsx", import.meta.url),
    "utf8",
  );
  const previewFile = new URL(
    "../app/_sites-preview/SkeletonPreview.tsx",
    import.meta.url,
  );

  assert.match(source, /aip-c01-progress-v1/);
  assert.match(source, /JSON\.stringify/);
  assert.match(source, /Export progress JSON/);
  assert.match(source, /Import and merge JSON/);
  assert.doesNotMatch(source, /was_selected/);
  await assert.rejects(readFile(previewFile));
});
