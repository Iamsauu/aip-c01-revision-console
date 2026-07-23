import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataRoot = new URL("../public/data/", import.meta.url);

async function readJson(name) {
  return JSON.parse(await readFile(new URL(name, dataRoot), "utf8"));
}

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  const [certification, domainsPayload, topicsPayload, servicesPayload, labsPayload] =
    await Promise.all([
      readJson("certification.json"),
      readJson("domains.json"),
      readJson("topics.json"),
      readJson("services.json"),
      readJson("labs.json"),
    ]);

  const domains = domainsPayload.items;
  const topics = topicsPayload.items;
  const services = servicesPayload.items;
  const labs = labsPayload.items;
  const tasks = domains.flatMap((domain) => domain.tasks);
  const skills = tasks.flatMap((task) => task.skills);

  assert.equal(domains.length, 5);
  assert.equal(tasks.length, 20);
  assert.equal(skills.length, 98);
  assert.equal(topics.length, 12);
  assert.equal(services.length, 106);
  assert.equal(labs.length, 6);
  assert.deepEqual(certification.coverage, {
    domains: 5,
    tasks: 20,
    skills: 98,
    scope_entries: 106,
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
