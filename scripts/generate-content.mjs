import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, "..");
const REPO_DIR = path.resolve(APP_DIR, "..");
const KB_DIR = path.join(REPO_DIR, "knowledge-base");
const OUT_DIR = path.join(APP_DIR, "public", "data");
const VERIFIED_AT = "2026-07-23";
const SCHEMA_VERSION = "1.0.0";

const OFFICIAL_GUIDE_URL =
  "https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html";

const DOMAIN_DEFS = [
  {
    id: "domain-1",
    code: "1",
    title: "Foundation Model Integration, Data Management, and Compliance",
    short_title: "Models, Data, RAG, and Prompts",
    summary:
      "Design the front half of production generative AI systems: model selection, model-ready data, vector retrieval, RAG, prompts, and compliance.",
    weight_percent: 31,
    approximate_scored_questions: 20,
    importance: "critical",
    file: "domains/domain-1-fm-integration-data-rag-prompts.md",
    tasks: [
      ["1.1", "Analyze requirements and design generative AI solutions"],
      ["1.2", "Select and configure foundation models"],
      ["1.3", "Implement data validation and processing"],
      ["1.4", "Design vector stores and embedding architectures"],
      ["1.5", "Implement retrieval-augmented generation"],
      ["1.6", "Implement prompt engineering and prompt governance"],
    ],
  },
  {
    id: "domain-2",
    code: "2",
    title: "Implementation and Integration",
    short_title: "Implementation and Agents",
    summary:
      "Turn foundation models into production applications with agents, tools, APIs, events, enterprise integrations, deployments, and developer workflows.",
    weight_percent: 26,
    approximate_scored_questions: 17,
    importance: "critical",
    file: "domains/domain-2-implementation-integration-agents.md",
    tasks: [
      ["2.1", "Implement agentic AI and tool integrations"],
      ["2.2", "Implement model deployment strategies"],
      ["2.3", "Integrate generative AI with enterprise systems"],
      ["2.4", "Implement foundation model API integrations"],
      ["2.5", "Implement application and developer-tool patterns"],
    ],
  },
  {
    id: "domain-3",
    code: "3",
    title: "AI Safety, Security, and Governance",
    short_title: "Safety and Governance",
    summary:
      "Protect inputs, outputs, data, identities, tools, and evidence with layered safety, privacy, security, governance, and Responsible AI controls.",
    weight_percent: 20,
    approximate_scored_questions: 13,
    importance: "high",
    file: "domains/domain-3-safety-security-governance.md",
    tasks: [
      ["3.1", "Implement input and output safety controls"],
      ["3.2", "Implement data security and privacy controls"],
      ["3.3", "Implement AI governance and compliance"],
      ["3.4", "Implement Responsible AI principles"],
    ],
  },
  {
    id: "domain-4",
    code: "4",
    title: "Operational Efficiency and Optimization",
    short_title: "Cost and Operations",
    summary:
      "Optimize tokens, cost, latency, throughput, retrieval, capacity, caching, and observability without silently reducing quality or safety.",
    weight_percent: 12,
    approximate_scored_questions: 8,
    importance: "important",
    file: "domains/domain-4-cost-performance-operations.md",
    tasks: [
      ["4.1", "Optimize cost and resource efficiency"],
      ["4.2", "Optimize application performance"],
      ["4.3", "Implement monitoring and operational visibility"],
    ],
  },
  {
    id: "domain-5",
    code: "5",
    title: "Testing, Validation, and Troubleshooting",
    short_title: "Evaluation and Troubleshooting",
    summary:
      "Evaluate models, prompts, RAG, agents, and deployed paths, then diagnose failures with controlled experiments and operational evidence.",
    weight_percent: 11,
    approximate_scored_questions: 7,
    importance: "important",
    file: "domains/domain-5-evaluation-troubleshooting.md",
    tasks: [
      ["5.1", "Implement evaluation and validation systems"],
      ["5.2", "Troubleshoot generative AI applications"],
    ],
  },
];

const TOPIC_DEFS = [
  {
    id: "model-selection-runtime-apis",
    title: "Bedrock Model Selection and Runtime APIs",
    file: "concepts/bedrock-model-selection-and-runtime-apis.md",
    description:
      "Choose models, inference modes, endpoint families, request contracts, routing, and resilience from explicit workload constraints.",
    mock_count: 12,
    decision_density: 8,
    source_title: "Models and model capabilities",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html",
  },
  {
    id: "rag-knowledge-bases-vector-search",
    title: "RAG, Knowledge Bases, and Vector Search",
    file: "concepts/rag-knowledge-bases-vector-search.md",
    description:
      "Design source ingestion, chunking, embeddings, metadata, vector storage, retrieval, reranking, grounding, citations, and refresh.",
    mock_count: 23,
    decision_density: 10,
    source_title: "Knowledge Bases for Amazon Bedrock",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html",
  },
  {
    id: "prompt-engineering-management-flows",
    title: "Prompt Engineering, Prompt Management, and Flows",
    file: "concepts/prompt-engineering-management-and-flows.md",
    description:
      "Treat prompts as versioned behavioral contracts with variables, output schemas, tests, promotion controls, and managed workflows.",
    mock_count: 8,
    decision_density: 7,
    source_title: "Prompt management in Amazon Bedrock",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html",
  },
  {
    id: "agents-tools-mcp-agentcore",
    title: "Agents, Tools, MCP, and Amazon Bedrock AgentCore",
    file: "concepts/agents-tools-mcp-and-agentcore.md",
    description:
      "Build bounded agents with typed tools, state, memory, stop rules, least privilege, human review, portable MCP interfaces, and traces.",
    mock_count: 15,
    decision_density: 10,
    source_title: "Amazon Bedrock AgentCore",
    source_url:
      "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html",
  },
  {
    id: "data-quality-multimodal-processing",
    title: "Data Quality and Multimodal Processing",
    file: "concepts/data-quality-and-multimodal-processing.md",
    description:
      "Validate and transform text, documents, images, audio, video, tables, and structured records before inference.",
    mock_count: 6,
    decision_density: 6,
    source_title: "AWS Glue Data Quality",
    source_url:
      "https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html",
  },
  {
    id: "safety-privacy-responsible-ai",
    title: "Safety, Privacy, and Responsible AI",
    file: "concepts/safety-privacy-and-responsible-ai.md",
    description:
      "Apply layered input, retrieval, model, tool, output, privacy, transparency, fairness, and governance controls.",
    mock_count: 20,
    decision_density: 9,
    source_title: "Amazon Bedrock Guardrails",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
  },
  {
    id: "security-networking-access-control",
    title: "Security, Networking, and Access Control",
    file: "concepts/security-networking-and-access-control.md",
    description:
      "Apply identity, least privilege, private networking, data authorization, encryption, audit, and retention controls.",
    mock_count: 8,
    decision_density: 8,
    source_title: "Security in Amazon Bedrock",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/security.html",
  },
  {
    id: "evaluation-testing-quality-gates",
    title: "Evaluation, Testing, and Quality Gates",
    file: "concepts/evaluation-testing-and-quality-gates.md",
    description:
      "Measure model, prompt, retrieval, agent, safety, fairness, performance, and business outcomes before and after release.",
    mock_count: 19,
    decision_density: 10,
    source_title: "Amazon Bedrock evaluations",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html",
  },
  {
    id: "cost-latency-throughput-caching",
    title: "Cost, Latency, Throughput, Routing, and Caching",
    file: "concepts/cost-latency-throughput-and-caching.md",
    description:
      "Optimize token budgets, capacity, batching, streaming, caching, model routing, throughput, cost, and reliability without hiding quality loss.",
    mock_count: 16,
    decision_density: 10,
    source_title: "Provisioned Throughput for Amazon Bedrock",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html",
  },
  {
    id: "observability-troubleshooting",
    title: "Observability and Troubleshooting",
    file: "concepts/observability-and-troubleshooting.md",
    description:
      "Correlate logs, metrics, traces, model interactions, retrieval, tools, safety decisions, costs, and quality signals to isolate failures.",
    mock_count: 6,
    decision_density: 9,
    source_title: "Monitor Amazon Bedrock with CloudWatch",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring-runtime-metrics.html",
  },
  {
    id: "enterprise-integration-cicd",
    title: "Enterprise Integration and CI/CD",
    file: "concepts/enterprise-integration-and-cicd.md",
    description:
      "Integrate stable APIs, queues, events, gateways, identity, workflows, tests, deployment controls, canaries, and rollback.",
    mock_count: 11,
    decision_density: 9,
    source_title: "AWS Well-Architected Generative AI Lens",
    source_url:
      "https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/generative-ai-lens.html",
  },
  {
    id: "sagemaker-custom-model-deployment",
    title: "SageMaker Custom and Open-Weight Model Deployment",
    file: "concepts/sagemaker-custom-model-deployment.md",
    description:
      "Deploy and operate custom or open-weight models with suitable containers, accelerators, storage, timeouts, scaling, batch processing, registry, and rollback.",
    mock_count: 4,
    decision_density: 7,
    source_title: "Deploy models for inference with SageMaker AI",
    source_url:
      "https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html",
  },
];

const TOPIC_STUDY_POINTS = {
  "model-selection-runtime-apis": {
    short_title: "Models and Runtime APIs",
    key_points: [
      "Select a model from modality, quality, context, Region, latency, throughput, safety, and cost constraints.",
      "Use Converse for a supported common conversational contract and InvokeModel for provider-native or specialized requests.",
      "Separate on-demand, provisioned, batch, cross-Region, and custom-serving decisions.",
    ],
    decision_rules: [
      "Choose the least operationally complex runtime that satisfies every hard requirement.",
      "Use Provisioned Throughput for predictable sustained demand; use cross-Region inference for eligible regional capacity resilience.",
      "Validate the selected model's current API, parameter, streaming, and Region support.",
    ],
    failure_modes: [
      "Sending one provider's JSON body to another model.",
      "Retrying sustained throttling without changing capacity or token load.",
      "Assuming every model supports Converse, streaming, or the same parameters.",
    ],
  },
  "rag-knowledge-bases-vector-search": {
    short_title: "RAG and Vector Search",
    key_points: [
      "Treat source, parsing, chunking, metadata, embedding, indexing, retrieval, reranking, generation, and evaluation as one system.",
      "Use metadata for authorization and scope; use hybrid retrieval when exact identifiers matter.",
      "Evaluate retrieval separately from answer generation.",
    ],
    decision_rules: [
      "Fix candidate retrieval before adding a reranker.",
      "Use hierarchical chunks when precise child matches need larger parent context.",
      "Track ingestion to terminal success before treating changed content as current.",
    ],
    failure_modes: [
      "Treating vector similarity as factual confidence.",
      "Using vector-only retrieval for error codes or exact identifiers.",
      "Changing prompts before inspecting retrieved chunks and metadata.",
    ],
  },
  "prompt-engineering-management-flows": {
    short_title: "Prompts and Flows",
    key_points: [
      "Treat prompts as versioned behavioral contracts with variables, constraints, examples, and output schemas.",
      "Use Prompt Management for reusable versions and references.",
      "Use an external release workflow for approval, testing, staged promotion, and rollback.",
    ],
    decision_rules: [
      "Test prompts on a fixed representative dataset before promotion.",
      "Use deterministic schema validation when downstream systems require structured output.",
      "Choose Flows for configured managed prompt graphs and Step Functions for durable deterministic orchestration.",
    ],
    failure_modes: [
      "Assuming prompt version creation is an approval workflow.",
      "Changing multiple prompt variables at once without a baseline.",
      "Using lower temperature as a substitute for grounding or validation.",
    ],
  },
  "agents-tools-mcp-agentcore": {
    short_title: "Agents, Tools, and MCP",
    key_points: [
      "Bound agents with typed tools, validation, least privilege, timeouts, maximum cycles, and explicit stop conditions.",
      "Separate session state from durable long-term memory.",
      "Use MCP when clients need a portable tool contract and choose runtime by state, duration, and streaming needs.",
    ],
    decision_rules: [
      "Keep consequential authorization and business rules outside the model.",
      "Use Step Functions callbacks for long human approvals.",
      "Add circuit breaking when repeated dependency failures would waste tokens or trigger unsafe loops.",
    ],
    failure_modes: [
      "Treating a tool schema as an authorization boundary.",
      "Retrying non-idempotent side effects without a stable business key.",
      "Allowing an unlimited reason-act loop.",
    ],
  },
  "data-quality-multimodal-processing": {
    short_title: "Data and Multimodal Processing",
    key_points: [
      "Validate completeness, format, freshness, lineage, and quarantine behavior before inference.",
      "Select managed extraction services by modality and required structure.",
      "Format the final request for the chosen model and API.",
    ],
    decision_rules: [
      "Use recurring managed data-quality rules for automated pipelines and interactive tools for exploration.",
      "Use Textract for document text, forms, and tables; use Transcribe for speech-to-text.",
      "Publish validation results as operational metrics and stop invalid records from reaching inference.",
    ],
    failure_modes: [
      "Sending malformed records directly to a model.",
      "Using manual data inspection for a recurring production feed.",
      "Assuming one multimodal request schema works for every model.",
    ],
  },
  "safety-privacy-responsible-ai": {
    short_title: "Safety and Responsible AI",
    key_points: [
      "Protect untrusted input, retrieved content, model output, tools, logs, and human decisions separately.",
      "Use deterministic application controls for authorization, transactions, schemas, and high-risk actions.",
      "Evaluate fairness and safety by cohort and adversarial case, not only overall averages.",
    ],
    decision_rules: [
      "Apply input controls before model exposure and output controls before returning content.",
      "Use consistent placeholders when masking must preserve entity relationships.",
      "Combine citations with grounding checks and insufficient-evidence behavior.",
    ],
    failure_modes: [
      "Using Guardrails as a replacement for application validation.",
      "Treating citations as proof that an answer is correct.",
      "Logging raw sensitive prompts merely to improve audit coverage.",
    ],
  },
  "security-networking-access-control": {
    short_title: "Security and Access",
    key_points: [
      "Combine identity, authorization, private paths, encryption, governed data permissions, audit, and retention.",
      "Use IAM Identity Center for workforce AWS access and Cognito for application end users.",
      "Treat model output and retrieved content as untrusted.",
    ],
    decision_rules: [
      "A VPC endpoint makes the path private; IAM and data policies still determine access.",
      "Use Macie for stored S3 discovery and runtime controls for live prompts.",
      "Minimize and sanitize logs before applying encryption and retention.",
    ],
    failure_modes: [
      "Equating private networking with authorization.",
      "Giving an agent a broad shared role for every tool.",
      "Using WAF as a semantic model-safety control.",
    ],
  },
  "evaluation-testing-quality-gates": {
    short_title: "Evaluation and Quality Gates",
    key_points: [
      "Evaluate quality, factuality, safety, fairness, latency, cost, retrieval, agents, and business outcomes.",
      "Version datasets, prompts, models, indexes, guardrails, rubrics, and judges.",
      "Combine deterministic checks, reference scoring, calibrated judges, human review, and production feedback.",
    ],
    decision_rules: [
      "Use one fixed benchmark when comparing candidate configurations.",
      "Gate releases on both aggregate and critical-cohort thresholds.",
      "Use canaries after offline evaluation to expose limited real production behavior.",
    ],
    failure_modes: [
      "Treating an LLM judge as objective truth.",
      "Hiding cohort failures behind an overall average.",
      "Calling repeated memorized mocks an unseen readiness signal.",
    ],
  },
  "cost-latency-throughput-caching": {
    short_title: "Cost and Performance",
    key_points: [
      "Capacity depends on input and output tokens, not request count alone.",
      "Measure time to first token separately from total latency.",
      "Optimize context, output limits, batching, caching, routing, and connection reuse before buying capacity.",
    ],
    decision_rules: [
      "Use prompt caching for an eligible stable prefix and response caching only with safe tenant, version, and authorization keys.",
      "Use batch inference for offline volume and streaming for perceived interactive latency.",
      "Evaluate quality per cost rather than model price alone.",
    ],
    failure_modes: [
      "Adding retries to sustained overload.",
      "Setting an excessive output-token ceiling.",
      "Caching personalized or authorization-sensitive answers under an incomplete key.",
    ],
  },
  "observability-troubleshooting": {
    short_title: "Observability and Diagnosis",
    key_points: [
      "Correlate one request across API, safety, retrieval, model, tools, validation, and response.",
      "Use CloudTrail for API audit, CloudWatch for logs and metrics, and X-Ray for request-path latency.",
      "Track semantic quality and business outcomes alongside operational telemetry.",
    ],
    decision_rules: [
      "Start diagnosis from the symptom, then inspect the narrowest evidence-producing component.",
      "Change one variable at a time to preserve causal attribution.",
      "Sanitize request metadata before logging and retain payloads only when classification permits.",
    ],
    failure_modes: [
      "Logging only unstructured error strings.",
      "Using infrastructure uptime as proof of answer quality.",
      "Exposing provider-internal reasoning instead of supported orchestration traces.",
    ],
  },
  "enterprise-integration-cicd": {
    short_title: "Integration and CI/CD",
    key_points: [
      "Choose APIs, queues, events, and workflows from synchronization, fanout, durability, latency, and failure behavior.",
      "Keep clients behind a stable validated gateway while models and providers change.",
      "Release code, prompts, models, guardrails, and infrastructure through tested, auditable promotion and rollback.",
    ],
    decision_rules: [
      "Use SQS for buffering and backpressure, EventBridge for rules and fanout, and SNS for push notifications.",
      "Acknowledge a tight webhook before slow model work by decoupling the request.",
      "Make all retried side effects idempotent.",
    ],
    failure_modes: [
      "Blocking a synchronous handler on long inference.",
      "Selecting Kubernetes when no Kubernetes requirement exists.",
      "Deploying a prompt or model change without a fixed quality gate and rollback target.",
    ],
  },
  "sagemaker-custom-model-deployment": {
    short_title: "SageMaker Deployment",
    key_points: [
      "Use SageMaker AI when a custom or open-weight model requires control of container, accelerator, storage, or serving stack.",
      "Size GPU memory, model artifacts, storage, download timeout, startup health timeout, and concurrency together.",
      "Version and approve models through Model Registry and controlled rollout.",
    ],
    decision_rules: [
      "Prefer Bedrock when its managed catalog and APIs meet the requirement.",
      "Use batch transformation for offline work and real-time endpoints for interactive serving.",
      "Diagnose startup failures from logs, storage, memory, image compatibility, and timeouts rather than increasing timeouts blindly.",
    ],
    failure_modes: [
      "Assuming timeout changes fix insufficient disk or GPU memory.",
      "Choosing custom hosting without a requirement for serving control.",
      "Changing container, instance, model, and parameters simultaneously during diagnosis.",
    ],
  },
};

const CANONICAL_PATH_TO_TOPIC = {
  "concepts/bedrock-model-selection-and-runtime-apis.md":
    "model-selection-runtime-apis",
  "reference/api-and-payload-cheat-sheet.md": "model-selection-runtime-apis",
  "concepts/rag-knowledge-bases-vector-search.md":
    "rag-knowledge-bases-vector-search",
  "concepts/prompt-engineering-management-and-flows.md":
    "prompt-engineering-management-flows",
  "concepts/agents-tools-mcp-and-agentcore.md":
    "agents-tools-mcp-agentcore",
  "concepts/data-quality-and-multimodal-processing.md":
    "data-quality-multimodal-processing",
  "concepts/safety-privacy-and-responsible-ai.md":
    "safety-privacy-responsible-ai",
  "concepts/security-networking-and-access-control.md":
    "security-networking-access-control",
  "concepts/evaluation-testing-and-quality-gates.md":
    "evaluation-testing-quality-gates",
  "concepts/cost-latency-throughput-and-caching.md":
    "cost-latency-throughput-caching",
  "concepts/observability-and-troubleshooting.md":
    "observability-troubleshooting",
  "concepts/enterprise-integration-and-cicd.md":
    "enterprise-integration-cicd",
  "concepts/sagemaker-custom-model-deployment.md":
    "sagemaker-custom-model-deployment",
  "domains/domain-1-fm-integration-data-rag-prompts.md":
    "model-selection-runtime-apis",
  "domains/domain-3-safety-security-governance.md":
    "safety-privacy-responsible-ai",
  "reference/aws-service-decision-catalog.md": "enterprise-integration-cicd",
};

const SERVICE_DOCS = {
  "Amazon Athena":
    "https://docs.aws.amazon.com/athena/latest/ug/what-is.html",
  "Amazon EMR":
    "https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html",
  "AWS Glue": "https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html",
  "Amazon Kinesis":
    "https://docs.aws.amazon.com/streams/latest/dev/introduction.html",
  "Amazon OpenSearch Service":
    "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html",
  "Amazon Quick Sight (formerly Amazon QuickSight)":
    "https://docs.aws.amazon.com/quicksight/latest/user/welcome.html",
  "Amazon MSK":
    "https://docs.aws.amazon.com/msk/latest/developerguide/what-is-msk.html",
  "Amazon AppFlow":
    "https://docs.aws.amazon.com/appflow/latest/userguide/what-is-appflow.html",
  "AWS AppConfig":
    "https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html",
  "Amazon EventBridge":
    "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html",
  "Amazon SNS": "https://docs.aws.amazon.com/sns/latest/dg/welcome.html",
  "Amazon SQS":
    "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
  "AWS Step Functions":
    "https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html",
  "AWS App Runner":
    "https://docs.aws.amazon.com/apprunner/latest/dg/what-is-apprunner.html",
  "Amazon EC2":
    "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html",
  "AWS Lambda": "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
  "Lambda@Edge":
    "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html",
  "AWS Outposts":
    "https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html",
  "AWS Wavelength":
    "https://docs.aws.amazon.com/wavelength/latest/developerguide/what-is-wavelength.html",
  "Amazon ECR":
    "https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html",
  "Amazon ECS":
    "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
  "Amazon EKS":
    "https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html",
  "AWS Fargate":
    "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html",
  "Amazon Connect":
    "https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html",
  "Amazon Aurora":
    "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html",
  "Amazon DocumentDB":
    "https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html",
  "Amazon DynamoDB":
    "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
  "DynamoDB Streams":
    "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html",
  "Amazon ElastiCache":
    "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html",
  "Amazon Neptune":
    "https://docs.aws.amazon.com/neptune/latest/userguide/intro.html",
  "Amazon RDS":
    "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html",
  "AWS Amplify":
    "https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html",
  "AWS CDK": "https://docs.aws.amazon.com/cdk/v2/guide/home.html",
  "AWS CLI":
    "https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html",
  "AWS CloudFormation":
    "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html",
  "AWS CodeArtifact":
    "https://docs.aws.amazon.com/codeartifact/latest/ug/welcome.html",
  "AWS CodeBuild":
    "https://docs.aws.amazon.com/codebuild/latest/userguide/welcome.html",
  "AWS CodeDeploy":
    "https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html",
  "AWS CodePipeline":
    "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html",
  Kiro: "https://aws.amazon.com/documentation-overview/kiro/",
  "AWS SDKs and tools":
    "https://docs.aws.amazon.com/sdkref/latest/guide/overview.html",
  "AWS X-Ray":
    "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html",
  "Amazon Augmented AI (A2I)":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/a2i.html",
  "Amazon Bedrock":
    "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html",
  "Bedrock AgentCore":
    "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html",
  "Bedrock Knowledge Bases":
    "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html",
  "Bedrock Prompt Management":
    "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html",
  "Bedrock Prompt Flows / Flows":
    "https://docs.aws.amazon.com/bedrock/latest/userguide/flows.html",
  "Amazon Comprehend":
    "https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html",
  "Amazon Kendra":
    "https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html",
  "Amazon Lex":
    "https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html",
  "Amazon Q Business":
    "https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/what-is.html",
  "Amazon Q Business Apps":
    "https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/purpose-built-qapps-web-experience.html",
  "Amazon Q Developer":
    "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/what-is.html",
  "Amazon Quick": "https://docs.aws.amazon.com/quick/latest/userguide/getting-started.html",
  "Amazon Rekognition":
    "https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html",
  "Amazon SageMaker AI":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html",
  "SageMaker Clarify":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-fairness-and-explainability.html",
  "SageMaker Data Wrangler":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html",
  "SageMaker Ground Truth":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/sms.html",
  "SageMaker JumpStart":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/studio-jumpstart.html",
  "SageMaker Model Monitor":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html",
  "SageMaker Model Registry":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html",
  "SageMaker Neo":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/neo.html",
  "SageMaker Processing":
    "https://docs.aws.amazon.com/sagemaker/latest/dg/processing-job.html",
  "SageMaker Unified Studio":
    "https://docs.aws.amazon.com/sagemaker-unified-studio/latest/userguide/what-is-sagemaker-unified-studio.html",
  "Amazon Textract":
    "https://docs.aws.amazon.com/textract/latest/dg/what-is.html",
  "Amazon Titan":
    "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-models.html",
  "Amazon Transcribe":
    "https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html",
  "AWS Auto Scaling":
    "https://docs.aws.amazon.com/autoscaling/plans/userguide/what-is-aws-auto-scaling.html",
  "AWS Chatbot":
    "https://docs.aws.amazon.com/chatbot/latest/adminguide/what-is.html",
  "AWS CloudTrail":
    "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
  "Amazon CloudWatch":
    "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
  "CloudWatch Logs":
    "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html",
  "CloudWatch Synthetics":
    "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html",
  "AWS Cost Anomaly Detection":
    "https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html",
  "AWS Cost Explorer":
    "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html",
  "Amazon Managed Grafana":
    "https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html",
  "AWS Service Catalog":
    "https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html",
  "AWS Systems Manager":
    "https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html",
  "AWS Well-Architected Tool":
    "https://docs.aws.amazon.com/wellarchitected/latest/userguide/intro.html",
  "AWS DataSync":
    "https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html",
  "AWS Transfer Family":
    "https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html",
  "Amazon API Gateway":
    "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html",
  "AWS AppSync":
    "https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html",
  "Amazon CloudFront":
    "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html",
  "Elastic Load Balancing":
    "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html",
  "AWS Global Accelerator":
    "https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html",
  "AWS PrivateLink":
    "https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html",
  "Amazon Route 53":
    "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html",
  "Amazon VPC":
    "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
  "Amazon Cognito":
    "https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html",
  "AWS Encryption SDK":
    "https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/introduction.html",
  "AWS IAM":
    "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html",
  "IAM Access Analyzer":
    "https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html",
  "IAM Identity Center":
    "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html",
  "AWS KMS":
    "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
  "Amazon Macie":
    "https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html",
  "AWS Secrets Manager":
    "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html",
  "AWS WAF":
    "https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html",
  "Amazon EBS":
    "https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html",
  "Amazon EFS":
    "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html",
  "Amazon S3":
    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html",
  "S3 Intelligent-Tiering":
    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering-overview.html",
  "S3 Lifecycle":
    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html",
  "S3 Cross-Region Replication":
    "https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html",
};

const LAB_DEFS = [
  {
    id: "lab-01",
    file: "labs/01-bedrock-api-and-streaming.md",
    title: "Bedrock API Contracts, Token Admission, and Streaming",
    summary:
      "Build a Bedrock Runtime client that validates model capabilities, counts tokens, invokes Converse, streams output, and records operational evidence.",
    importance: "critical",
    estimated_minutes: 90,
    topic_ids: [
      "model-selection-runtime-apis",
      "cost-latency-throughput-caching",
      "observability-troubleshooting",
    ],
    source_title: "Use the Converse API",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html",
  },
  {
    id: "lab-02",
    file: "labs/02-rag-knowledge-base.md",
    title: "RAG Knowledge Base, Hybrid Retrieval, and Reranking",
    summary:
      "Build a diagnostic RAG corpus and test chunking, metadata, embeddings, semantic and hybrid retrieval, reranking, synchronization, and citations.",
    importance: "critical",
    estimated_minutes: 150,
    topic_ids: ["rag-knowledge-bases-vector-search"],
    source_title: "Knowledge Bases for Amazon Bedrock",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html",
  },
  {
    id: "lab-03",
    file: "labs/03-guardrails-and-private-access.md",
    title: "Guardrails and Private Access",
    summary:
      "Protect input, retrieval, inference, output, logs, network paths, and governed data with Guardrails, IAM, VPC endpoints, and Lake Formation.",
    importance: "critical",
    estimated_minutes: 150,
    topic_ids: [
      "safety-privacy-responsible-ai",
      "security-networking-access-control",
    ],
    source_title: "Amazon Bedrock Guardrails",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
  },
  {
    id: "lab-04",
    file: "labs/04-agent-tools-and-step-functions.md",
    title: "Bounded Agent Tools with AWS Step Functions",
    summary:
      "Build a bounded reason-act workflow with typed tools, validation, retries, circuit breaking, approval callbacks, idempotency, and audit evidence.",
    importance: "critical",
    estimated_minutes: 180,
    topic_ids: [
      "agents-tools-mcp-agentcore",
      "enterprise-integration-cicd",
      "security-networking-access-control",
    ],
    source_title: "AWS Step Functions",
    source_url:
      "https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html",
  },
  {
    id: "lab-05",
    file: "labs/05-model-rag-agent-evaluation.md",
    title: "Model, RAG, and Agent Evaluation",
    summary:
      "Build versioned benchmarks that compare model and prompt configurations, isolate retrieval quality, evaluate agents, and enforce release gates.",
    importance: "critical",
    estimated_minutes: 120,
    topic_ids: [
      "evaluation-testing-quality-gates",
      "rag-knowledge-bases-vector-search",
      "agents-tools-mcp-agentcore",
    ],
    source_title: "Amazon Bedrock evaluations",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html",
  },
  {
    id: "lab-06",
    file: "labs/06-observability-cost-and-performance.md",
    title: "Observability, Cost, and Performance",
    summary:
      "Instrument a GenAI request path with correlation, metrics, alarms, traces, token signals, performance experiments, and failure injection.",
    importance: "critical",
    estimated_minutes: 120,
    topic_ids: [
      "observability-troubleshooting",
      "cost-latency-throughput-caching",
    ],
    source_title: "Monitor Amazon Bedrock with CloudWatch",
    source_url:
      "https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring-runtime-metrics.html",
  },
];

const MCQ_DEFS = [
  {
    id: "question-001",
    type: "single",
    mode: "comparison",
    topic_id: "model-selection-runtime-apis",
    prompt:
      "An application must use one conversational request structure across several supported Amazon Bedrock chat models. Which API is the best default?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock", "AWS SDKs and tools"],
    choices: [
      [
        "Converse",
        "Correct. Converse provides a common message interface for supported conversational models.",
        true,
      ],
      [
        "InvokeModel with one identical JSON body for every model",
        "Incorrect. InvokeModel request bodies remain model and provider specific.",
        false,
      ],
      [
        "SageMaker InvokeEndpoint",
        "Incorrect. This is for a deployed SageMaker endpoint, not managed Bedrock chat models.",
        false,
      ],
      [
        "Amazon SQS SendMessage",
        "Incorrect. SQS decouples work but is not a foundation-model inference API.",
        false,
      ],
    ],
  },
  {
    id: "question-002",
    type: "single",
    mode: "scenario",
    topic_id: "model-selection-runtime-apis",
    prompt:
      "One required Bedrock model serves interactive traffic in a fixed Region. Demand rises predictably every weekday and sustained throttling occurs. Which capacity choice best fits?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock", "Amazon CloudWatch"],
    choices: [
      [
        "Provisioned Throughput sized from token and request demand",
        "Correct. Predictable sustained demand for one required model is the main provisioned-capacity case.",
        true,
      ],
      [
        "Unbounded SDK retries",
        "Incorrect. Retries amplify sustained overload and do not create capacity.",
        false,
      ],
      [
        "Cross-Region inference without checking residency",
        "Incorrect. Cross-Region routing addresses eligible regional capacity and resilience, not a fixed-Region requirement.",
        false,
      ],
      [
        "A larger CloudWatch log group",
        "Incorrect. Logging capacity does not change model inference capacity.",
        false,
      ],
    ],
  },
  {
    id: "question-003",
    type: "single",
    mode: "troubleshooting",
    topic_id: "rag-knowledge-bases-vector-search",
    prompt:
      "A runbook assistant answers natural-language symptom queries well but misses exact error codes that exist in indexed chunks. What should be changed first?",
    source_service: "Amazon OpenSearch Service",
    service_names: [
      "Amazon OpenSearch Service",
      "Bedrock Knowledge Bases",
    ],
    choices: [
      [
        "Use hybrid lexical and vector retrieval, then rerank a sufficient candidate set",
        "Correct. Lexical retrieval preserves exact tokens while vector retrieval covers semantic symptoms.",
        true,
      ],
      [
        "Increase model temperature",
        "Incorrect. Generation randomness cannot recover candidates that retrieval omitted.",
        false,
      ],
      [
        "Replace every chunk with a much larger chunk",
        "Incorrect. Larger chunks can reduce retrieval precision and do not guarantee exact-token matching.",
        false,
      ],
      [
        "Rerank before retrieving candidates",
        "Incorrect. A reranker can only reorder candidates already retrieved.",
        false,
      ],
    ],
  },
  {
    id: "question-004",
    type: "single",
    mode: "troubleshooting",
    topic_id: "rag-knowledge-bases-vector-search",
    prompt:
      "Source documents are replaced and deleted during the day, but a knowledge base sometimes cites obsolete versions. Which action directly addresses freshness?",
    source_service: "Bedrock Knowledge Bases",
    service_names: ["Bedrock Knowledge Bases", "Amazon S3"],
    choices: [
      [
        "Trigger or schedule ingestion and verify the job reaches terminal success",
        "Correct. Source changes are not current in retrieval until synchronization completes successfully.",
        true,
      ],
      [
        "Fine-tune the foundation model after every document change",
        "Incorrect. Frequently changing factual content belongs in synchronized retrieval, not repeated model training.",
        false,
      ],
      [
        "Increase output token limits",
        "Incorrect. Output capacity does not update indexed source content.",
        false,
      ],
      [
        "Hide citations",
        "Incorrect. Removing evidence conceals the symptom rather than fixing stale retrieval.",
        false,
      ],
    ],
  },
  {
    id: "question-005",
    type: "multiple",
    mode: "scenario",
    topic_id: "prompt-engineering-management-flows",
    prompt:
      "A shared production prompt needs reusable versions, approval evidence, regression testing, staged promotion, and rapid rollback. Which TWO controls are required?",
    source_service: "Bedrock Prompt Management",
    service_names: [
      "Bedrock Prompt Management",
      "AWS CodePipeline",
      "AWS AppConfig",
    ],
    choices: [
      [
        "Store immutable prompt versions in Bedrock Prompt Management",
        "Correct. Versioned prompt artifacts provide stable references and rollback targets.",
        true,
      ],
      [
        "Use a release pipeline with tests and an explicit approval gate",
        "Correct. Organizational promotion and approval remain external release controls.",
        true,
      ],
      [
        "Treat creation of a prompt version as automatic production approval",
        "Incorrect. Versioning alone does not prove review or promotion authorization.",
        false,
      ],
      [
        "Edit the production prompt in place without retaining the previous version",
        "Incorrect. This removes traceability and a safe rollback target.",
        false,
      ],
      [
        "Test only whether the prompt is grammatically correct",
        "Incorrect. Regression tests must validate required behavior and output contracts.",
        false,
      ],
    ],
  },
  {
    id: "question-006",
    type: "single",
    mode: "troubleshooting",
    topic_id: "prompt-engineering-management-flows",
    prompt:
      "A prompt update improves tone but occasionally omits a required JSON field. What is the strongest release control?",
    source_service: "Bedrock Prompt Management",
    service_names: ["Bedrock Prompt Management", "AWS CodePipeline"],
    choices: [
      [
        "Validate the schema on a fixed regression set and block promotion when the contract fails",
        "Correct. Deterministic schema checks should gate a required machine-readable contract.",
        true,
      ],
      [
        "Lower temperature and deploy immediately",
        "Incorrect. Lower randomness cannot guarantee a required field and does not provide release evidence.",
        false,
      ],
      [
        "Increase the model's output limit",
        "Incorrect. More output capacity does not enforce the JSON schema.",
        false,
      ],
      [
        "Ask users to retry malformed responses",
        "Incorrect. This shifts a preventable contract failure to users.",
        false,
      ],
    ],
  },
  {
    id: "question-007",
    type: "single",
    mode: "comparison",
    topic_id: "agents-tools-mcp-agentcore",
    prompt:
      "A high-risk agent workflow sometimes needs an engineer approval that can take two days. Which pattern preserves state without keeping compute running?",
    source_service: "AWS Step Functions",
    service_names: ["AWS Step Functions", "AWS Lambda"],
    choices: [
      [
        "A Step Functions Standard callback task with a task token",
        "Correct. The workflow can pause durably and resume from a trusted callback.",
        true,
      ],
      [
        "A Lambda function that sleeps until approval",
        "Incorrect. Lambda is not designed to wait for a multi-day human decision.",
        false,
      ],
      [
        "A model loop that repeatedly asks whether approval arrived",
        "Incorrect. Polling wastes tokens and leaves approval control to a probabilistic component.",
        false,
      ],
      [
        "An SNS notification with no stored workflow state",
        "Incorrect. Notification alone does not preserve or resume the controlled workflow.",
        false,
      ],
    ],
  },
  {
    id: "question-008",
    type: "multiple",
    mode: "troubleshooting",
    topic_id: "agents-tools-mcp-agentcore",
    prompt:
      "An agent repeatedly calls a failing dependency and consumes tokens without progress. Which TWO controls most directly stop the failure pattern?",
    source_service: "AWS Step Functions",
    service_names: ["AWS Step Functions", "Amazon DynamoDB"],
    choices: [
      [
        "A maximum cycle count with an explicit terminal state",
        "Correct. A hard bound prevents an unlimited reason-act loop.",
        true,
      ],
      [
        "A circuit breaker that opens after repeated dependency failures",
        "Correct. The breaker prevents calls while the dependency remains unhealthy.",
        true,
      ],
      [
        "An unlimited retry policy",
        "Incorrect. Unlimited retries worsen token waste and dependency pressure.",
        false,
      ],
      [
        "Broader tool permissions",
        "Incorrect. Additional permissions do not repair dependency health and increase risk.",
        false,
      ],
      [
        "A larger model context window",
        "Incorrect. More context does not create a stop condition.",
        false,
      ],
    ],
  },
  {
    id: "question-009",
    type: "single",
    mode: "scenario",
    topic_id: "data-quality-multimodal-processing",
    prompt:
      "Nightly JSON records in S3 must satisfy required-field and non-empty-value rules before inference. Failed records need quarantine and operational metrics. Which service is the best fit?",
    source_service: "AWS Glue",
    service_names: ["AWS Glue", "Amazon S3", "Amazon CloudWatch"],
    choices: [
      [
        "AWS Glue Data Quality in the processing job",
        "Correct. Managed rules can enforce, quarantine, and publish recurring data-quality results.",
        true,
      ],
      [
        "Manual inspection in SageMaker Data Wrangler every night",
        "Incorrect. Interactive manual preparation does not meet recurring automated enforcement.",
        false,
      ],
      [
        "A foundation model asked to guess missing values",
        "Incorrect. Probabilistic inference is not a deterministic data-quality gate.",
        false,
      ],
      [
        "CloudTrail event history",
        "Incorrect. CloudTrail audits API activity but does not validate record completeness.",
        false,
      ],
    ],
  },
  {
    id: "question-010",
    type: "multiple",
    mode: "comparison",
    topic_id: "data-quality-multimodal-processing",
    prompt:
      "A workflow must extract tables from scanned forms and transcribe recorded calls. Which TWO managed services match the modalities?",
    source_service: "Amazon Textract",
    service_names: ["Amazon Textract", "Amazon Transcribe"],
    choices: [
      [
        "Amazon Textract for document text, forms, and tables",
        "Correct. Textract extracts structured content from documents.",
        true,
      ],
      [
        "Amazon Transcribe for speech-to-text",
        "Correct. Transcribe processes recorded or streaming speech.",
        true,
      ],
      [
        "Amazon Macie for audio transcription",
        "Incorrect. Macie discovers sensitive data in S3 objects; it is not a speech recognizer.",
        false,
      ],
      [
        "Amazon Route 53 for table extraction",
        "Incorrect. Route 53 provides DNS and routing, not document extraction.",
        false,
      ],
      [
        "AWS WAF for optical character recognition",
        "Incorrect. WAF filters web requests and does not perform OCR.",
        false,
      ],
    ],
  },
  {
    id: "question-011",
    type: "single",
    mode: "comparison",
    topic_id: "safety-privacy-responsible-ai",
    prompt:
      "Sensitive identifiers must be detected and masked in live user text before it reaches a model. Which choice best fits the real-time requirement?",
    source_service: "Amazon Comprehend",
    service_names: [
      "Amazon Comprehend",
      "Amazon Macie",
      "Amazon Bedrock",
    ],
    choices: [
      [
        "Runtime preprocessing with Comprehend PII detection or supported Guardrail PII controls",
        "Correct. These controls can act on live text before or during the inference path.",
        true,
      ],
      [
        "Amazon Macie as a synchronous chat interceptor",
        "Incorrect. Macie is for sensitive-data discovery in S3, not live prompt interception.",
        false,
      ],
      [
        "CloudTrail after the prompt has already reached the model",
        "Incorrect. Audit evidence after exposure is not preventive redaction.",
        false,
      ],
      [
        "A larger context window",
        "Incorrect. Context size does not protect sensitive data.",
        false,
      ],
    ],
  },
  {
    id: "question-012",
    type: "single",
    mode: "scenario",
    topic_id: "safety-privacy-responsible-ai",
    prompt:
      "A chatbot must return a customer's latest five transaction amounts without fabrication and must never execute write SQL. Which design is safest?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock", "Amazon API Gateway", "AWS IAM"],
    choices: [
      [
        "Use the model only for intent mapping, then authorize and run an approved parameterized read-only query in application code",
        "Correct. Deterministic code owns authorization, data access, and exact financial values.",
        true,
      ],
      [
        "Let the model generate and execute arbitrary SQL",
        "Incorrect. Free-form generated SQL is not a safe authorization or write boundary.",
        false,
      ],
      [
        "Ask the model to remember prior transaction values",
        "Incorrect. Model memory is not the authoritative transaction system.",
        false,
      ],
      [
        "Use Guardrails alone to guarantee exact amounts",
        "Incorrect. Guardrails address supported safety policies, not deterministic database correctness.",
        false,
      ],
    ],
  },
  {
    id: "question-013",
    type: "multiple",
    mode: "scenario",
    topic_id: "security-networking-access-control",
    prompt:
      "A private workload must invoke Bedrock without public internet access and only from an approved application role. Which TWO controls are necessary?",
    source_service: "AWS PrivateLink",
    service_names: ["AWS PrivateLink", "Amazon VPC", "AWS IAM"],
    choices: [
      [
        "A supported interface VPC endpoint with restrictive endpoint and network policies",
        "Correct. The endpoint provides a private service path and can restrict use.",
        true,
      ],
      [
        "Least-privilege IAM permission for the approved model and actions",
        "Correct. Private connectivity does not replace authorization.",
        true,
      ],
      [
        "A public NAT gateway as the only path",
        "Incorrect. That does not satisfy the no-public-path requirement.",
        false,
      ],
      [
        "No IAM policy because the endpoint is private",
        "Incorrect. Network location alone does not authorize service actions.",
        false,
      ],
      [
        "Amazon Macie attached to every runtime request",
        "Incorrect. Macie does not establish Bedrock network connectivity or runtime authorization.",
        false,
      ],
    ],
  },
  {
    id: "question-014",
    type: "single",
    mode: "comparison",
    topic_id: "security-networking-access-control",
    prompt:
      "Employees need federated workforce access to AWS accounts and permission sets. Which identity service is the direct fit?",
    source_service: "IAM Identity Center",
    service_names: ["IAM Identity Center", "Amazon Cognito"],
    choices: [
      [
        "IAM Identity Center",
        "Correct. It manages workforce access, groups, and permission sets across AWS accounts.",
        true,
      ],
      [
        "Amazon Cognito user pools",
        "Incorrect. Cognito primarily provides application end-user identity, not workforce AWS permission sets.",
        false,
      ],
      [
        "AWS WAF",
        "Incorrect. WAF filters web requests and is not a workforce identity provider.",
        false,
      ],
      [
        "Amazon S3 Lifecycle",
        "Incorrect. Lifecycle manages object retention and storage transitions.",
        false,
      ],
    ],
  },
  {
    id: "question-015",
    type: "single",
    mode: "scenario",
    topic_id: "evaluation-testing-quality-gates",
    prompt:
      "Three models and two prompts must be compared fairly on quality, latency, tokens, and human preference. What should the team do first?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock", "Amazon S3"],
    choices: [
      [
        "Run every candidate combination against the same versioned representative benchmark",
        "Correct. A fixed dataset and controlled settings make comparisons attributable.",
        true,
      ],
      [
        "Give each model a different convenient sample",
        "Incorrect. Different samples confound the comparison.",
        false,
      ],
      [
        "Select the model with the lowest token price before measuring quality",
        "Incorrect. Price alone ignores retries, escalation, rework, and business effectiveness.",
        false,
      ],
      [
        "Deploy every candidate to all users immediately",
        "Incorrect. Offline evaluation should precede a limited production canary.",
        false,
      ],
    ],
  },
  {
    id: "question-016",
    type: "single",
    mode: "troubleshooting",
    topic_id: "evaluation-testing-quality-gates",
    prompt:
      "A RAG assistant produces unsupported answers. Which test best isolates whether candidate retrieval is the problem?",
    source_service: "Bedrock Knowledge Bases",
    service_names: ["Bedrock Knowledge Bases"],
    choices: [
      [
        "Run retrieve-only evaluation and inspect content, metadata, rank, and coverage",
        "Correct. Removing generation isolates retrieval quality.",
        true,
      ],
      [
        "Change the model, prompt, index, and chunking in one experiment",
        "Incorrect. Multiple simultaneous changes destroy causal attribution.",
        false,
      ],
      [
        "Measure only API availability",
        "Incorrect. Availability cannot show whether retrieved evidence is relevant.",
        false,
      ],
      [
        "Increase answer temperature",
        "Incorrect. More randomness cannot diagnose missing evidence.",
        false,
      ],
    ],
  },
  {
    id: "question-017",
    type: "multiple",
    mode: "scenario",
    topic_id: "cost-latency-throughput-caching",
    prompt:
      "A chat application has a large stable prompt prefix and users wait too long before seeing the first token. Quality and the model must remain unchanged. Which TWO changes directly help?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock"],
    choices: [
      [
        "Use prompt caching for the eligible stable prefix",
        "Correct. Prompt caching can avoid repeated processing of eligible shared prefix content.",
        true,
      ],
      [
        "Stream output and measure time to first token separately",
        "Correct. Streaming reduces perceived wait even when total generation time is similar.",
        true,
      ],
      [
        "Increase maximum output tokens substantially",
        "Incorrect. A larger ceiling can increase capacity and cost exposure.",
        false,
      ],
      [
        "Add unlimited retries",
        "Incorrect. Retries can increase latency and overload.",
        false,
      ],
      [
        "Disable all latency metrics",
        "Incorrect. Removing evidence makes optimization harder.",
        false,
      ],
    ],
  },
  {
    id: "question-018",
    type: "single",
    mode: "troubleshooting",
    topic_id: "cost-latency-throughput-caching",
    prompt:
      "Request count is stable, but tenants send prompts of very different sizes and intermittently throttle. What is the best admission-control unit?",
    source_service: "Amazon Bedrock",
    service_names: ["Amazon Bedrock", "Amazon DynamoDB"],
    choices: [
      [
        "Estimated input tokens plus output budget, enforced by a per-tenant token bucket",
        "Correct. Token demand better represents model capacity than request count.",
        true,
      ],
      [
        "Only requests per minute",
        "Incorrect. Equal request counts can represent very different token demand.",
        false,
      ],
      [
        "CloudTrail event count",
        "Incorrect. Audit events are not an inference-capacity unit.",
        false,
      ],
      [
        "Number of S3 objects",
        "Incorrect. Stored object count does not measure an assembled runtime request.",
        false,
      ],
    ],
  },
  {
    id: "question-019",
    type: "single",
    mode: "comparison",
    topic_id: "observability-troubleshooting",
    prompt:
      "An auditor asks who changed an AWS resource, while an engineer asks why one request was slow. Which mapping is correct?",
    source_service: "AWS CloudTrail",
    service_names: ["AWS CloudTrail", "AWS X-Ray", "Amazon CloudWatch"],
    choices: [
      [
        "CloudTrail for API audit; X-Ray and correlated metrics for request-path latency",
        "Correct. These services answer different evidence questions.",
        true,
      ],
      [
        "X-Ray for identity audit; CloudTrail for model quality",
        "Incorrect. X-Ray traces request paths, and CloudTrail does not evaluate semantic quality.",
        false,
      ],
      [
        "CloudWatch Synthetics for every historical API change",
        "Incorrect. Canaries test deployed paths; they are not the authoritative API audit.",
        false,
      ],
      [
        "One raw prompt log for both requirements",
        "Incorrect. Raw payload logging creates privacy risk and still may not isolate a distributed latency segment.",
        false,
      ],
    ],
  },
  {
    id: "question-020",
    type: "single",
    mode: "troubleshooting",
    topic_id: "observability-troubleshooting",
    prompt:
      "A GenAI API has latency spikes across retrieval, model invocation, and tools. What evidence design best isolates the slow component?",
    source_service: "AWS X-Ray",
    service_names: ["AWS X-Ray", "Amazon CloudWatch", "CloudWatch Logs"],
    choices: [
      [
        "A correlation ID, structured component metrics, and distributed trace segments",
        "Correct. Correlated evidence separates retrieval, model, tool, and application latency.",
        true,
      ],
      [
        "Only a final total-latency number",
        "Incorrect. End-to-end latency does not identify the responsible component.",
        false,
      ],
      [
        "Unstructured error strings without request identity",
        "Incorrect. These cannot reliably join events across services.",
        false,
      ],
      [
        "Provider-internal chain-of-thought logs",
        "Incorrect. Internal reasoning is not the supported operational trace and should not be exposed.",
        false,
      ],
    ],
  },
  {
    id: "question-021",
    type: "single",
    mode: "scenario",
    topic_id: "enterprise-integration-cicd",
    prompt:
      "A legacy HTTPS webhook needs acknowledgment within two seconds, traffic is bursty, and model output can update a CRM later. Which architecture best fits?",
    source_service: "Amazon SQS",
    service_names: [
      "Amazon API Gateway",
      "Amazon SQS",
      "AWS Lambda",
    ],
    choices: [
      [
        "API Gateway validates and enqueues to SQS; workers process asynchronously with idempotent CRM updates",
        "Correct. The queue decouples acknowledgment from slow work and absorbs bursts.",
        true,
      ],
      [
        "Keep the webhook open until the model and CRM both finish",
        "Incorrect. Slow downstream work violates the acknowledgment constraint.",
        false,
      ],
      [
        "Use EventBridge as a worker-consumed backlog with no queue",
        "Incorrect. EventBridge routes events, while SQS supplies backlog and worker backpressure.",
        false,
      ],
      [
        "Retry CRM writes without an idempotency key",
        "Incorrect. At-least-once delivery can duplicate side effects.",
        false,
      ],
    ],
  },
  {
    id: "question-022",
    type: "single",
    mode: "comparison",
    topic_id: "enterprise-integration-cicd",
    prompt:
      "A producer must publish one business event and allow new rule-based consumers to be added without changing producer code. Which service is the best fit?",
    source_service: "Amazon EventBridge",
    service_names: ["Amazon EventBridge", "Amazon SQS", "Amazon SNS"],
    choices: [
      [
        "Amazon EventBridge",
        "Correct. Event rules and targets support decoupled routing and fanout.",
        true,
      ],
      [
        "Amazon SQS as the only destination",
        "Incorrect. SQS is strongest for backlog and worker consumption, not changing rule-based fanout by itself.",
        false,
      ],
      [
        "A direct synchronous call to every consumer",
        "Incorrect. This tightly couples the producer to current consumers.",
        false,
      ],
      [
        "Amazon EBS",
        "Incorrect. EBS provides block storage, not event routing.",
        false,
      ],
    ],
  },
  {
    id: "question-023",
    type: "multiple",
    mode: "troubleshooting",
    topic_id: "sagemaker-custom-model-deployment",
    prompt:
      "A 70 GB open-weight model on a SageMaker real-time endpoint fails while downloading and loading, and the initial storage is too small. Which TWO corrections address the stated causes?",
    source_service: "Amazon SageMaker AI",
    service_names: ["Amazon SageMaker AI", "Amazon EBS"],
    choices: [
      [
        "Provide sufficient endpoint storage for model artifacts and runtime files",
        "Correct. The model cannot load when the attached storage is insufficient.",
        true,
      ],
      [
        "Set model-download and startup-health timeouts to realistic values after sizing resources",
        "Correct. Large models can require longer legitimate download and initialization time.",
        true,
      ],
      [
        "Only increase retries from the client",
        "Incorrect. Client retries do not repair endpoint storage or startup configuration.",
        false,
      ],
      [
        "Reduce CloudTrail retention",
        "Incorrect. Audit retention does not change model loading.",
        false,
      ],
      [
        "Assume any GPU topology can hold the model",
        "Incorrect. GPU memory and serving topology must also be validated.",
        false,
      ],
    ],
  },
  {
    id: "question-024",
    type: "single",
    mode: "comparison",
    topic_id: "sagemaker-custom-model-deployment",
    prompt:
      "A required open-weight model is not available through Bedrock, and the team needs a custom container, accelerator selection, and serving configuration. Which platform is the stronger fit?",
    source_service: "Amazon SageMaker AI",
    service_names: ["Amazon SageMaker AI", "Amazon Bedrock", "Amazon ECR"],
    choices: [
      [
        "Amazon SageMaker AI",
        "Correct. SageMaker provides control over model artifacts, containers, accelerators, endpoints, and scaling.",
        true,
      ],
      [
        "Bedrock solely because it has lower operational overhead",
        "Incorrect. Managed simplicity cannot satisfy a model and serving stack that Bedrock does not support.",
        false,
      ],
      [
        "Amazon Route 53",
        "Incorrect. DNS routing does not host the model.",
        false,
      ],
      [
        "AWS CloudTrail",
        "Incorrect. CloudTrail records API activity and is not an inference platform.",
        false,
      ],
    ],
  },
];

const QUESTION_SOURCES = {
  "question-001": [
    [
      "Use the Converse API",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html",
    ],
  ],
  "question-002": [
    [
      "Provisioned Throughput for Amazon Bedrock",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prov-throughput.html",
    ],
  ],
  "question-003": [
    [
      "Neural and hybrid search in OpenSearch Serverless",
      "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-configure-neural-search.html",
    ],
  ],
  "question-004": [
    [
      "Knowledge Base data sources",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-ds.html",
    ],
  ],
  "question-005": [
    [
      "Deploy prompt versions",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management-deploy.html",
    ],
    [
      "AWS CodePipeline",
      "https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html",
    ],
  ],
  "question-006": [
    [
      "Prompt management in Amazon Bedrock",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-management.html",
    ],
  ],
  "question-007": [
    [
      "Step Functions callback tasks",
      "https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html#connect-wait-token",
    ],
  ],
  "question-008": [
    [
      "Step Functions error handling",
      "https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html",
    ],
  ],
  "question-009": [
    [
      "AWS Glue Data Quality",
      "https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html",
    ],
  ],
  "question-010": [
    [
      "What is Amazon Textract?",
      "https://docs.aws.amazon.com/textract/latest/dg/what-is.html",
    ],
    [
      "What is Amazon Transcribe?",
      "https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html",
    ],
  ],
  "question-011": [
    [
      "Amazon Comprehend PII detection",
      "https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html",
    ],
    [
      "Amazon Bedrock Guardrails",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
    ],
  ],
  "question-012": [
    [
      "Amazon Bedrock Guardrails",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
    ],
    [
      "IAM least privilege",
      "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
    ],
  ],
  "question-013": [
    [
      "VPC endpoints for Amazon Bedrock",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html",
    ],
    [
      "IAM least privilege",
      "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
    ],
  ],
  "question-014": [
    [
      "What is IAM Identity Center?",
      "https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html",
    ],
  ],
  "question-015": [
    [
      "Amazon Bedrock evaluations",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html",
    ],
  ],
  "question-016": [
    [
      "Knowledge Base evaluation metrics",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-evaluation-metrics.html",
    ],
  ],
  "question-017": [
    [
      "Prompt caching for Amazon Bedrock",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html",
    ],
    [
      "Use the Converse API",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html",
    ],
  ],
  "question-018": [
    [
      "CountTokens API",
      "https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_CountTokens.html",
    ],
  ],
  "question-019": [
    [
      "AWS CloudTrail User Guide",
      "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
    ],
    [
      "AWS X-Ray Developer Guide",
      "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html",
    ],
  ],
  "question-020": [
    [
      "AWS X-Ray Developer Guide",
      "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html",
    ],
    [
      "CloudWatch Logs Insights",
      "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html",
    ],
  ],
  "question-021": [
    [
      "Amazon SQS Developer Guide",
      "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
    ],
    [
      "Amazon API Gateway",
      "https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html",
    ],
  ],
  "question-022": [
    [
      "What is Amazon EventBridge?",
      "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html",
    ],
  ],
  "question-023": [
    [
      "SageMaker Large Model Inference",
      "https://docs.aws.amazon.com/sagemaker/latest/dg/large-model-inference.html",
    ],
    [
      "Deploy models for inference",
      "https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html",
    ],
  ],
  "question-024": [
    [
      "Deploy models for inference with SageMaker AI",
      "https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html",
    ],
  ],
};

const RECALL_TOPIC_RANGES = [
  [1, 5, "model-selection-runtime-apis"],
  [6, 7, "data-quality-multimodal-processing"],
  [8, 8, "model-selection-runtime-apis"],
  [9, 18, "rag-knowledge-bases-vector-search"],
  [19, 20, "prompt-engineering-management-flows"],
  [21, 29, "agents-tools-mcp-agentcore"],
  [30, 35, "enterprise-integration-cicd"],
  [36, 39, "model-selection-runtime-apis"],
  [40, 40, "sagemaker-custom-model-deployment"],
  [41, 47, "safety-privacy-responsible-ai"],
  [48, 52, "security-networking-access-control"],
  [53, 55, "evaluation-testing-quality-gates"],
  [56, 66, "cost-latency-throughput-caching"],
  [67, 70, "observability-troubleshooting"],
  [71, 79, "evaluation-testing-quality-gates"],
  [80, 80, "rag-knowledge-bases-vector-search"],
  [81, 85, "observability-troubleshooting"],
];

const SCENARIO_TOPIC_IDS = [
  "cost-latency-throughput-caching",
  "rag-knowledge-bases-vector-search",
  "cost-latency-throughput-caching",
  "agents-tools-mcp-agentcore",
  "safety-privacy-responsible-ai",
  "prompt-engineering-management-flows",
  "rag-knowledge-bases-vector-search",
  "cost-latency-throughput-caching",
  "model-selection-runtime-apis",
  "enterprise-integration-cicd",
  "model-selection-runtime-apis",
  "agents-tools-mcp-agentcore",
  "evaluation-testing-quality-gates",
  "sagemaker-custom-model-deployment",
  "enterprise-integration-cicd",
  "safety-privacy-responsible-ai",
  "rag-knowledge-bases-vector-search",
  "observability-troubleshooting",
  "evaluation-testing-quality-gates",
  "security-networking-access-control",
];

const TRAP_TOPIC_IDS = [
  "enterprise-integration-cicd",
  "cost-latency-throughput-caching",
  "cost-latency-throughput-caching",
  "cost-latency-throughput-caching",
  "cost-latency-throughput-caching",
  "model-selection-runtime-apis",
  "enterprise-integration-cicd",
  "enterprise-integration-cicd",
  "agents-tools-mcp-agentcore",
  "agents-tools-mcp-agentcore",
  "agents-tools-mcp-agentcore",
  "agents-tools-mcp-agentcore",
  "agents-tools-mcp-agentcore",
  "observability-troubleshooting",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "rag-knowledge-bases-vector-search",
  "model-selection-runtime-apis",
  "model-selection-runtime-apis",
  "cost-latency-throughput-caching",
  "evaluation-testing-quality-gates",
  "prompt-engineering-management-flows",
  "safety-privacy-responsible-ai",
  "safety-privacy-responsible-ai",
  "safety-privacy-responsible-ai",
  "security-networking-access-control",
  "safety-privacy-responsible-ai",
  "security-networking-access-control",
  "observability-troubleshooting",
  "security-networking-access-control",
  "evaluation-testing-quality-gates",
  "evaluation-testing-quality-gates",
  "evaluation-testing-quality-gates",
  "evaluation-testing-quality-gates",
  "sagemaker-custom-model-deployment",
];

function read(relativePath) {
  return fs.readFileSync(path.join(KB_DIR, relativePath), "utf8");
}

function normalizeVisibleDashes(value) {
  if (typeof value === "string") {
    return value.replaceAll("\u2013", "-").replaceAll("\u2014", "-");
  }
  if (Array.isArray(value)) {
    return value.map(normalizeVisibleDashes);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        normalizeVisibleDashes(child),
      ]),
    );
  }
  return value;
}

function slug(value) {
  return normalizeVisibleDashes(value)
    .toLowerCase()
    .replace(/amazon|aws/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/-+/g, "-");
}

function sourceForDomain(domainCode) {
  return {
    source_title: `Official AIP-C01 Domain ${domainCode}`,
    source_url: `https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain${domainCode}.html`,
    verified_at: VERIFIED_AT,
  };
}

function sourceForTopic(topic) {
  return {
    source_title: topic.source_title,
    source_url: topic.source_url,
    verified_at: VERIFIED_AT,
  };
}

function uiImportance(value) {
  if (value === "critical") return "Critical";
  if (value === "recognition") return "Awareness";
  return "Important";
}

function sourceArray(sourceTitle, sourceUrl, publisher = "AWS") {
  return [
    {
      title: sourceTitle,
      url: sourceUrl,
      publisher,
      verified_at: VERIFIED_AT,
    },
  ];
}

function currentServiceLabel(name) {
  if (name === "Amazon Quick Sight (formerly Amazon QuickSight)") {
    return "Amazon Quick Sight";
  }
  if (name === "AWS Chatbot") {
    return "Amazon Q Developer in chat applications";
  }
  return name;
}

function serviceAliases(name) {
  if (name === "Amazon Quick Sight (formerly Amazon QuickSight)") {
    return ["Amazon QuickSight", "QuickSight"];
  }
  if (name === "AWS Chatbot") {
    return ["AWS Chatbot"];
  }
  if (name === "Bedrock Prompt Flows / Flows") {
    return ["Amazon Bedrock Prompt Flows", "Amazon Bedrock Flows"];
  }
  return [];
}

function serviceEntityType(name) {
  const featureNames = new Set([
    "Lambda@Edge",
    "DynamoDB Streams",
    "Bedrock AgentCore",
    "Bedrock Knowledge Bases",
    "Bedrock Prompt Management",
    "Bedrock Prompt Flows / Flows",
    "SageMaker Clarify",
    "SageMaker Data Wrangler",
    "SageMaker Ground Truth",
    "SageMaker JumpStart",
    "SageMaker Model Monitor",
    "SageMaker Model Registry",
    "SageMaker Neo",
    "SageMaker Processing",
    "SageMaker Unified Studio",
    "CloudWatch Logs",
    "CloudWatch Synthetics",
    "IAM Access Analyzer",
    "S3 Intelligent-Tiering",
    "S3 Lifecycle",
    "S3 Cross-Region Replication",
  ]);
  const capabilityNames = new Set(["AWS SDKs and tools", "Amazon Titan"]);
  if (capabilityNames.has(name)) return "capability";
  if (featureNames.has(name)) return "feature";
  return "service";
}

function serviceConfusions(name) {
  const groups = [
    [
      ["Amazon SQS", "Amazon EventBridge", "Amazon SNS"],
      "Queue and backpressure versus event routing versus push notification",
    ],
    [
      ["AWS CloudTrail", "Amazon CloudWatch", "CloudWatch Logs", "AWS X-Ray"],
      "API audit versus metrics and logs versus request-path tracing",
    ],
    [
      ["Amazon Macie", "Amazon Comprehend", "Amazon Bedrock"],
      "Stored S3 discovery versus live text detection versus model safety controls",
    ],
    [
      ["AWS WAF", "Amazon Bedrock"],
      "Web-layer filtering versus semantic foundation-model Guardrails",
    ],
    [
      ["Amazon Kendra", "Amazon Q Business", "Bedrock Knowledge Bases"],
      "Enterprise search versus enterprise assistant versus managed RAG component",
    ],
    [
      ["SageMaker Data Wrangler", "AWS Glue"],
      "Interactive data preparation versus recurring managed data-quality rules",
    ],
    [
      ["Amazon EKS", "Amazon ECS", "AWS Fargate", "AWS Lambda"],
      "Kubernetes requirement versus managed containers versus short serverless compute",
    ],
    [
      ["AWS PrivateLink", "AWS IAM", "Amazon VPC"],
      "Private network path versus authorization and network isolation",
    ],
    [
      ["Amazon OpenSearch Service", "Amazon Aurora"],
      "Search and hybrid retrieval versus relational and transactional semantics",
    ],
    [
      ["AWS Step Functions", "Bedrock Prompt Flows / Flows", "Bedrock AgentCore"],
      "Durable deterministic workflow versus configured prompt graph versus agent runtime",
    ],
  ];
  return groups
    .filter(([names]) => names.includes(name))
    .map(([, confusion]) => confusion);
}

function splitRoleAndBoundary(text) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return {
    role: sentences[0] ?? text,
    boundary:
      sentences.slice(1).join(" ") ||
      "Select only when the scenario requirements match this service's responsibility.",
  };
}

function parseSkills() {
  const lines = read("01-coverage-matrix.md").split(/\r?\n/);
  const skills = [];
  for (const line of lines) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 4 || !/^[1-5]\.\d+\.\d+$/.test(cells[0])) {
      continue;
    }
    const [, canonicalPath] =
      cells[2].match(/\[[^\]]+\]\(([^)]+)\)/) ?? [];
    const topicId = CANONICAL_PATH_TO_TOPIC[canonicalPath];
    if (!topicId) {
      throw new Error(
        `No topic mapping for canonical skill path: ${canonicalPath}`,
      );
    }
    const domainCode = cells[0].split(".")[0];
    const taskCode = cells[0].split(".").slice(0, 2).join(".");
    const source = sourceForDomain(domainCode);
    skills.push({
      id: `skill-${cells[0]}`,
      code: cells[0],
      domain_id: `domain-${domainCode}`,
      task_id: `task-${taskCode}`,
      topic_id: topicId,
      topic_ids: [topicId],
      title: cells[1],
      status: cells[3].toLowerCase(),
      canonical_path: `knowledge-base/${canonicalPath}`,
      ...source,
      sources: sourceArray(source.source_title, source.source_url),
    });
  }
  return skills.sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
}

function buildDomainsAndTasks(skills) {
  const tasks = DOMAIN_DEFS.flatMap((domain) =>
    domain.tasks.map(([code, title]) => {
      const taskSkills = skills.filter((skill) => skill.task_id === `task-${code}`);
      const source = sourceForDomain(domain.code);
      return {
        id: `task-${code}`,
        code,
        domain_id: domain.id,
        title,
        summary: taskSkills.map((skill) => skill.title).join("; "),
        importance: uiImportance(domain.importance),
        depth_label: "mastery",
        skill_ids: taskSkills.map((skill) => skill.id),
        skill_count: taskSkills.length,
        topic_ids: [...new Set(taskSkills.map((skill) => skill.topic_id))],
        ...source,
        sources: sourceArray(source.source_title, source.source_url),
      };
    }),
  );

  const domains = DOMAIN_DEFS.map((domain) => {
    const source = sourceForDomain(domain.code);
    return {
      id: domain.id,
      code: domain.code,
      title: domain.title,
      short_title: domain.short_title,
      summary: domain.summary,
      weight: domain.weight_percent,
      weight_percent: domain.weight_percent,
      approximate_scored_questions: domain.approximate_scored_questions,
      importance: uiImportance(domain.importance),
      task_ids: domain.tasks.map(([code]) => `task-${code}`),
      task_count: domain.tasks.length,
      skill_count: skills.filter((skill) => skill.domain_id === domain.id).length,
      content_markdown: read(domain.file),
      canonical_path: `knowledge-base/${domain.file}`,
      ...source,
      sources: sourceArray(source.source_title, source.source_url),
    };
  });

  return { domains, tasks };
}

function importanceLabel(score) {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "supporting";
  return "recognition";
}

function buildTopics(skills) {
  const weightByDomain = Object.fromEntries(
    DOMAIN_DEFS.map((domain) => [domain.id, domain.weight_percent]),
  );
  return TOPIC_DEFS.map((topic) => {
    const topicSkills = skills.filter((skill) => skill.topic_id === topic.id);
    const domainIds = [...new Set(topicSkills.map((skill) => skill.domain_id))];
    const maxDomainWeight = Math.max(
      ...domainIds.map((domainId) => weightByDomain[domainId]),
    );
    const score = Math.round(
      35 * (maxDomainWeight / 31) +
        30 * Math.min(topicSkills.length / 8, 1) +
        20 * Math.min(topic.mock_count / 12, 1) +
        15 * Math.min(topic.decision_density / 10, 1),
    );
    const importanceKey = importanceLabel(score);
    const studyPoints = TOPIC_STUDY_POINTS[topic.id];
    const source = sourceForTopic(topic);
    return {
      id: topic.id,
      title: topic.title,
      short_title: studyPoints.short_title,
      summary: topic.description,
      description: topic.description,
      why_it_matters: `${topic.description} It maps to ${topicSkills.length} official skills and ${topic.mock_count} local practice objectives.`,
      importance: uiImportance(importanceKey),
      importance_key: importanceKey,
      importance_score: score,
      importance_reason: `Domain weight, ${topicSkills.length} official skill mappings, ${topic.mock_count} local practice mappings, and decision density ${topic.decision_density}/10.`,
      depth_label: score >= 75 ? "mastery" : "decision",
      domain_ids: domainIds,
      task_ids: [...new Set(topicSkills.map((skill) => skill.task_id))],
      skill_ids: topicSkills.map((skill) => skill.id),
      skill_count: topicSkills.length,
      local_mock_mapping_count: topic.mock_count,
      decision_density: topic.decision_density,
      service_ids: [],
      key_points: studyPoints.key_points,
      decision_rules: studyPoints.decision_rules,
      failure_modes: studyPoints.failure_modes,
      content_markdown: read(topic.file),
      canonical_path: `knowledge-base/${topic.file}`,
      ...source,
      sources: sourceArray(source.source_title, source.source_url),
    };
  });
}

function inferServiceTopics(category, name, role) {
  const haystack = `${name} ${role}`.toLowerCase();
  const topicIds = [];
  const add = (id, regex) => {
    if (regex.test(haystack)) topicIds.push(id);
  };

  add(
    "rag-knowledge-bases-vector-search",
    /knowledge base|rag|vector|embedding|search|kendra|neptune|aurora|document|s3|data source/,
  );
  add(
    "agents-tools-mcp-agentcore",
    /agent|tool|memory|step functions|lambda|fargate|ecs|eks|human-review|callback/,
  );
  add(
    "safety-privacy-responsible-ai",
    /guardrail|moderation|bias|explain|pii|sensitive|human-review|label/,
  );
  add(
    "security-networking-access-control",
    /iam|identity|private|vpc|encrypt|secret|waf|macie|cognito|permission|residency|outposts/,
  );
  add(
    "evaluation-testing-quality-gates",
    /evaluat|test|quality|monitor|feedback|dashboard|report|synthetic|clarify/,
  );
  add(
    "cost-latency-throughput-caching",
    /cache|scale|capacity|throughput|cost|edge|batch|stream|latency/,
  );
  add(
    "observability-troubleshooting",
    /cloudwatch|cloudtrail|x-ray|grafana|log|metric|alarm|trace|monitor|anomaly/,
  );
  add(
    "enterprise-integration-cicd",
    /api|event|queue|notification|pipeline|build|deploy|artifact|iac|integration|web|transfer|workflow|crm|container/,
  );
  add(
    "data-quality-multimodal-processing",
    /etl|data quality|audio|speech|image|video|ocr|textract|transcribe|rekognition|processing|catalog/,
  );
  add(
    "model-selection-runtime-apis",
    /bedrock|foundation model|titan|sdk|cli|inference|model routing/,
  );
  add(
    "prompt-engineering-management-flows",
    /prompt|flow|configuration|appconfig/,
  );
  add(
    "sagemaker-custom-model-deployment",
    /sagemaker|model registry|container image|gpu|neo|jumpstart|endpoint/,
  );

  if (topicIds.length === 0) {
    const fallback = {
      Analytics: "data-quality-multimodal-processing",
      "Application integration": "enterprise-integration-cicd",
      Compute: "enterprise-integration-cicd",
      Containers: "enterprise-integration-cicd",
      "Customer engagement": "enterprise-integration-cicd",
      Databases: "rag-knowledge-bases-vector-search",
      "Developer tools": "enterprise-integration-cicd",
      "Machine learning and GenAI": "model-selection-runtime-apis",
      "Management and governance": "observability-troubleshooting",
      "Migration and transfer": "enterprise-integration-cicd",
      "Networking and content delivery": "security-networking-access-control",
      "Security, identity, and compliance":
        "security-networking-access-control",
      Storage: "rag-knowledge-bases-vector-search",
    }[category];
    topicIds.push(fallback);
  }
  return [...new Set(topicIds)].sort();
}

function parseServices() {
  const lines = read("reference/aws-service-decision-catalog.md").split(/\r?\n/);
  const services = [];
  let category = "";
  for (const line of lines) {
    if (line.startsWith("## ")) {
      category = line.slice(3).trim();
      continue;
    }
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 3 || !/^[123]$/.test(cells[1])) continue;
    const [name, depthText, role] = cells;
    const depth = Number(depthText);
    const sourceUrl = SERVICE_DOCS[name];
    if (!sourceUrl) {
      throw new Error(`Missing item-specific official documentation for ${name}`);
    }
    const labels = {
      depth_label:
        depth === 1
          ? "implementation"
          : depth === 2
            ? "architecture-decision"
            : "recognition",
      importance:
        depth === 1 ? "Critical" : depth === 2 ? "Important" : "Awareness",
    };
    const { role: serviceRole, boundary } = splitRoleAndBoundary(role);
    const sourceTitle = `${currentServiceLabel(name)} documentation`;
    services.push({
      id: `service-${slug(name)}`,
      name,
      exam_label: name,
      current_label: currentServiceLabel(name),
      aliases: serviceAliases(name),
      category,
      entity_type: serviceEntityType(name),
      depth,
      depth_tier: depth,
      depth_label: labels.depth_label,
      importance: labels.importance,
      importance_reason:
        depth === 1
          ? "Implementation-depth service used directly in production design and troubleshooting decisions."
          : depth === 2
            ? "Architecture-decision service that must be distinguished from nearby alternatives."
            : "Recognition-depth service: know its role and eliminate it when scenario constraints do not match.",
      role: serviceRole,
      boundary,
      use_when: [serviceRole],
      avoid_when: [boundary],
      confusions: serviceConfusions(name),
      exam_role_and_boundary: role,
      topic_ids: inferServiceTopics(category, name, role),
      domain_ids: [],
      skill_ids: [],
      source_title: sourceTitle,
      source_url: sourceUrl,
      verified_at: VERIFIED_AT,
      sources: sourceArray(sourceTitle, sourceUrl),
    });
  }
  return services;
}

function extractSectionList(markdown, headingPattern) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) return [];
  const items = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) break;
    const match = lines[index].match(
      /^\s*(?:[-*]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)(.+)$/,
    );
    if (match) items.push(match[1].trim().replace(/\.$/, ""));
  }
  return items;
}

function buildLabs() {
  return LAB_DEFS.map((lab) => {
    const content = read(lab.file);
    const objectives = extractSectionList(content, /^##\s+Objective\s*$/i);
    const evidence = extractSectionList(
      content,
      /^##\s+(?:Validation evidence|Validation evidence checklist|Validation checklist)\s*$/i,
    );
    return {
      ...lab,
      duration_minutes: lab.estimated_minutes,
      importance: uiImportance(lab.importance),
      objectives:
        objectives.length > 0
          ? objectives
          : [`Complete the guided implementation for ${lab.title}`],
      evidence:
        evidence.length > 0
          ? evidence
          : ["Capture the lab validation checklist and expected failure results"],
      domain_ids: [],
      service_ids: [],
      canonical_path: `knowledge-base/${lab.file}`,
      content_markdown: content,
      verified_at: VERIFIED_AT,
      sources: sourceArray(lab.source_title, lab.source_url),
    };
  });
}

function topicById(topicId) {
  const topic = TOPIC_DEFS.find((candidate) => candidate.id === topicId);
  if (!topic) throw new Error(`Unknown topic: ${topicId}`);
  return topic;
}

function buildMcqQuestions(topics, services) {
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  const servicesByName = new Map(
    services.flatMap((service) => [
      [service.name, service],
      [service.current_label, service],
    ]),
  );
  return MCQ_DEFS.map((definition) => {
    const topic = topicsById.get(definition.topic_id);
    if (!topic) throw new Error(`Unknown MCQ topic: ${definition.topic_id}`);
    const sourceService = servicesByName.get(definition.source_service);
    if (!sourceService) {
      throw new Error(`Unknown MCQ source service: ${definition.source_service}`);
    }
    const choicesWithCorrectness = definition.choices.map(
      ([text, rationale, isCorrect], index) => ({
        id: `${definition.id}-${String.fromCharCode(97 + index)}`,
        text,
        rationale,
        is_correct: isCorrect,
      }),
    );
    const correctAnswerIds = choicesWithCorrectness
      .filter((choice) => choice.is_correct)
      .map((choice) => choice.id);
    if (definition.type === "single" && choicesWithCorrectness.length !== 4) {
      throw new Error(`${definition.id} must have exactly four choices`);
    }
    if (definition.type === "single" && correctAnswerIds.length !== 1) {
      throw new Error(`${definition.id} must have exactly one correct answer`);
    }
    if (definition.type === "multiple" && choicesWithCorrectness.length < 5) {
      throw new Error(`${definition.id} must have at least five choices`);
    }
    if (definition.type === "multiple" && correctAnswerIds.length < 2) {
      throw new Error(`${definition.id} must have at least two correct answers`);
    }
    const relatedServices = definition.service_names.map((name) => {
      const service = servicesByName.get(name);
      if (!service) throw new Error(`${definition.id} references unknown ${name}`);
      return service.id;
    });
    const questionSources = QUESTION_SOURCES[definition.id];
    if (!questionSources || questionSources.length === 0) {
      throw new Error(`${definition.id} lacks question-specific sources`);
    }
    const source = questionSources.map(([title, url]) => ({
      title,
      url,
      publisher: "AWS",
      verified_at: VERIFIED_AT,
    }));
    const choices = choicesWithCorrectness.map(
      ({ id, text, rationale }) => ({ id, text, rationale }),
    );
    return {
      id: definition.id,
      type: definition.type,
      mode: definition.mode,
      prompt: definition.prompt,
      choices,
      correct_answer_ids: correctAnswerIds,
      explanation: choicesWithCorrectness
        .filter((choice) => choice.is_correct)
        .map((choice) => choice.rationale)
        .join(" "),
      domain_ids: topic.domain_ids,
      topic_ids: [topic.id],
      service_ids: [...new Set(relatedServices)],
      importance: topic.importance,
      sources: source,
      source_title: source[0].title,
      source_url: source[0].url,
      verified_at: VERIFIED_AT,
    };
  });
}

function recallTopicForNumber(number) {
  const match = RECALL_TOPIC_RANGES.find(
    ([start, end]) => number >= start && number <= end,
  );
  if (!match) throw new Error(`No topic mapping for recall question ${number}`);
  return match[2];
}

function parseRecallQuestions() {
  const content = read("practice/recall-questions.md");
  const [questionPart, answerPart] = content.split("## Short answer key");
  const questionMatches = [
    ...questionPart.matchAll(/^(\d+)\.\s+(.+)$/gm),
  ].map((match) => [Number(match[1]), match[2].trim()]);
  const answerMatches = [...answerPart.matchAll(/^(\d+)\.\s+(.+)$/gm)].map(
    (match) => [Number(match[1]), match[2].trim()],
  );
  const answers = new Map(answerMatches);
  return questionMatches.map(([number, prompt]) => {
    const topicId = recallTopicForNumber(number);
    const topic = topicById(topicId);
    const domainCode =
      number <= 20
        ? 1
        : number <= 40
          ? 2
          : number <= 55
            ? 3
            : number <= 70
              ? 4
              : 5;
    return {
      id: `recall-${String(number).padStart(3, "0")}`,
      type: "recall",
      prompt,
      answer: answers.get(number),
      domain_id: `domain-${domainCode}`,
      topic_id: topicId,
      importance: "high",
      difficulty: number % 5 === 0 ? "hard" : "medium",
      source_title: topic.source_title,
      source_url: topic.source_url,
      verified_at: VERIFIED_AT,
    };
  });
}

function parseNumberedSections(content, startHeading, endHeading) {
  const start = content.indexOf(startHeading);
  const end = endHeading ? content.indexOf(endHeading, start + startHeading.length) : content.length;
  const region = content.slice(start + startHeading.length, end);
  const headingRegex = /^###\s+(\d+)(?:\.\s+(.+))?$/gm;
  const headings = [...region.matchAll(headingRegex)];
  return headings.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd =
      index + 1 < headings.length ? headings[index + 1].index : region.length;
    return {
      number: Number(match[1]),
      title: match[2]?.trim() ?? "",
      body: region.slice(bodyStart, bodyEnd).trim(),
    };
  });
}

function parseScenarios() {
  const content = read("practice/scenario-drills.md");
  const prompts = parseNumberedSections(content, "## Scenarios", "## Answer key");
  const answers = parseNumberedSections(content, "## Answer key");
  const answersByNumber = new Map(
    answers.map((answer) => [answer.number, answer.body]),
  );
  return prompts.map((scenario) => {
    const topicId = SCENARIO_TOPIC_IDS[scenario.number - 1];
    const topic = topicById(topicId);
    return {
      id: `scenario-${String(scenario.number).padStart(2, "0")}`,
      type: "scenario",
      title: scenario.title,
      prompt: scenario.body,
      answer: answersByNumber.get(scenario.number),
      topic_id: topicId,
      domain_ids: [],
      importance: "critical",
      difficulty: "hard",
      source_title: topic.source_title,
      source_url: topic.source_url,
      verified_at: VERIFIED_AT,
    };
  });
}

function parseTraps() {
  const content = read("practice/exam-traps-and-distractors.md");
  const end = content.indexOf("## Five-step option test");
  const region = content.slice(0, end);
  const headingRegex = /^##\s+(\d+)\.\s+(.+)$/gm;
  const headings = [...region.matchAll(headingRegex)];
  return headings.map((match, index) => {
    const number = Number(match[1]);
    const bodyStart = match.index + match[0].length;
    const bodyEnd =
      index + 1 < headings.length ? headings[index + 1].index : region.length;
    const topicId = TRAP_TOPIC_IDS[number - 1];
    const topic = topicById(topicId);
    return {
      id: `trap-${String(number).padStart(2, "0")}`,
      type: "trap",
      title: match[2].trim(),
      prompt: `Explain why "${match[2].trim()}" is an exam trap and state the correct decision rule.`,
      answer: region.slice(bodyStart, bodyEnd).trim(),
      topic_id: topicId,
      importance: "high",
      difficulty: "medium",
      source_title: topic.source_title,
      source_url: topic.source_url,
      verified_at: VERIFIED_AT,
    };
  });
}

function parseOfficialSources() {
  const content = read("reference/official-sources.md");
  const sources = [];
  let category = "";
  for (const line of content.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      category = line.slice(3).trim();
      continue;
    }
    const match = line.match(/^- \[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
    if (!match) continue;
    sources.push({
      id: `source-${String(sources.length + 1).padStart(3, "0")}`,
      category,
      source_title: match[1],
      source_url: match[2],
      verified_at: VERIFIED_AT,
    });
  }
  return sources;
}

function buildReferences() {
  const files = [
    ["api-payloads", "reference/api-and-payload-cheat-sheet.md"],
    ["architecture-decisions", "reference/architecture-decision-tables.md"],
    ["service-catalog", "reference/aws-service-decision-catalog.md"],
    ["glossary", "reference/glossary.md"],
    ["metrics-errors-limits", "reference/metrics-errors-and-limits.md"],
    ["official-sources", "reference/official-sources.md"],
  ];
  return files.map(([id, file]) => {
    const content = read(file);
    const title = content.match(/^#\s+(.+)$/m)?.[1] ?? id;
    return {
      id: `reference-${id}`,
      title,
      canonical_path: `knowledge-base/${file}`,
      content_markdown: content,
      source_title: "AIP-C01 official source registry",
      source_url: OFFICIAL_GUIDE_URL,
      verified_at: VERIFIED_AT,
    };
  });
}

function assertExactCount(label, items, expected) {
  if (items.length !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${items.length}`);
  }
}

function assertUniqueIds(label, items) {
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label} contains duplicate IDs`);
  }
}

function validate(data) {
  assertExactCount("domains", data.domains, 5);
  assertExactCount("tasks", data.tasks, 20);
  assertExactCount("skills", data.skills, 98);
  assertExactCount("topics", data.topics, 12);
  assertExactCount("services", data.services, 106);
  assertExactCount("labs", data.labs, 6);
  assertExactCount("source recall cards", data.sourcePractice.recall, 85);
  assertExactCount("source scenario cards", data.sourcePractice.scenarios, 20);
  assertExactCount("source trap cards", data.sourcePractice.traps, 40);
  assertExactCount("original MCQs", data.questions, 24);
  assertExactCount("official source registry", data.sources, 71);

  for (const [label, items] of Object.entries({
    domains: data.domains,
    tasks: data.tasks,
    skills: data.skills,
    topics: data.topics,
    services: data.services,
    labs: data.labs,
    questions: data.questions,
    sources: data.sources,
  })) {
    assertUniqueIds(label, items);
    for (const item of items) {
      for (const field of ["source_url", "source_title", "verified_at"]) {
        if (!item[field]) throw new Error(`${label}/${item.id} lacks ${field}`);
      }
    }
  }

  for (const item of [
    ...data.domains,
    ...data.tasks,
    ...data.skills,
    ...data.topics,
    ...data.services,
    ...data.labs,
    ...data.questions,
  ]) {
    if (!Array.isArray(item.sources) || item.sources.length === 0) {
      throw new Error(`${item.id} lacks structured sources`);
    }
  }

  if (
    data.certification.question_count !== 75 ||
    data.certification.scored_question_count !== 65 ||
    data.certification.unscored_question_count !== 10 ||
    data.certification.duration_minutes !== 180
  ) {
    throw new Error("Certification aliases do not match current exam metadata");
  }
  if (
    data.certification.coverage.domains !== 5 ||
    data.certification.coverage.tasks !== 20 ||
    data.certification.coverage.skills !== 98 ||
    data.certification.coverage.scope_entries !== 106
  ) {
    throw new Error("Certification coverage aliases are incomplete");
  }

  const validImportance = new Set(["Critical", "Important", "Awareness"]);
  for (const item of [
    ...data.skills,
    ...data.topics,
    ...data.services,
    ...data.labs,
    ...data.questions,
  ]) {
    if (!validImportance.has(item.importance)) {
      throw new Error(`${item.id} has invalid importance ${item.importance}`);
    }
  }

  for (const service of data.services) {
    if (
      !service.source_url.startsWith("https://docs.aws.amazon.com/") &&
      !service.source_url.startsWith(
        "https://aws.amazon.com/documentation-overview/",
      )
    ) {
      throw new Error(
        `${service.name} does not have an official item-specific documentation URL`,
      );
    }
    if (service.topic_ids.length === 0) {
      throw new Error(`${service.name} has no canonical topic mapping`);
    }
    if (
      ![1, 2, 3].includes(service.depth_tier) ||
      !["service", "feature", "capability"].includes(service.entity_type) ||
      !Array.isArray(service.use_when) ||
      !Array.isArray(service.avoid_when)
    ) {
      throw new Error(`${service.name} lacks UI-compatible service aliases`);
    }
  }

  const taskIds = new Set(data.tasks.map((task) => task.id));
  const topicIds = new Set(data.topics.map((topic) => topic.id));
  for (const skill of data.skills) {
    if (!taskIds.has(skill.task_id)) {
      throw new Error(`${skill.id} references unknown task ${skill.task_id}`);
    }
    if (!topicIds.has(skill.topic_id)) {
      throw new Error(`${skill.id} references unknown topic ${skill.topic_id}`);
    }
    if (
      skill.topic_ids.length === 0 ||
      skill.service_ids.length === 0 ||
      skill.sources.length === 0
    ) {
      throw new Error(`${skill.id} lacks structured relationships`);
    }
  }

  for (const topic of data.topics) {
    for (const field of [
      "key_points",
      "decision_rules",
      "failure_modes",
      "service_ids",
    ]) {
      if (!Array.isArray(topic[field]) || topic[field].length === 0) {
        throw new Error(`${topic.id} lacks ${field}`);
      }
    }
  }

  for (const lab of data.labs) {
    if (
      lab.duration_minutes <= 0 ||
      lab.objectives.length === 0 ||
      lab.evidence.length === 0 ||
      lab.domain_ids.length === 0 ||
      lab.service_ids.length === 0
    ) {
      throw new Error(`${lab.id} lacks UI-compatible lab metadata`);
    }
  }

  for (const question of data.questions) {
    if (
      !["single", "multiple"].includes(question.type) ||
      question.choices.length < 4 ||
      question.correct_answer_ids.length === 0 ||
      question.domain_ids.length === 0 ||
      question.topic_ids.length === 0 ||
      question.service_ids.length === 0
    ) {
      throw new Error(`${question.id} lacks MCQ-ready fields`);
    }
    if (question.choices.some((choice) => !choice.rationale)) {
      throw new Error(`${question.id} contains a distractor without rationale`);
    }
  }

  const allText = JSON.stringify(normalizeVisibleDashes(data));
  if (/[\u2013\u2014]/u.test(allText)) {
    throw new Error("Generated content contains a visible en dash or em dash");
  }
  if (
    data.sourcePractice.recall.some((item) => "answers" in item) ||
    data.sourcePractice.scenarios.some((item) => "answers" in item)
  ) {
    throw new Error("Unexpected imported multiple-choice payload");
  }
}

function stableJson(value) {
  return `${JSON.stringify(normalizeVisibleDashes(value), null, 2)}\n`;
}

function writeJson(fileName, value) {
  const output = stableJson(value);
  fs.writeFileSync(path.join(OUT_DIR, fileName), output, "utf8");
  return {
    file: fileName,
    sha256: crypto.createHash("sha256").update(output).digest("hex"),
  };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const skills = parseSkills();
  const { domains, tasks } = buildDomainsAndTasks(skills);
  const topics = buildTopics(skills);
  const topicImportance = Object.fromEntries(
    topics.map((topic) => [topic.id, topic.importance]),
  );
  for (const skill of skills) {
    skill.importance = topicImportance[skill.topic_id];
    skill.importance_key = skill.importance.toLowerCase();
    skill.depth_label =
      skill.importance === "Critical" ? "mastery" : "decision";
  }
  const services = parseServices();
  const labs = buildLabs();
  const sourcePractice = {
    recall: parseRecallQuestions(),
    scenarios: parseScenarios(),
    traps: parseTraps(),
  };
  const topicRelationships = Object.fromEntries(
    topics.map((topic) => [
      topic.id,
      {
        domain_ids: topic.domain_ids,
        task_ids: topic.task_ids,
        skill_ids: topic.skill_ids,
      },
    ]),
  );
  for (const service of services) {
    service.domain_ids = [
      ...new Set(
        service.topic_ids.flatMap(
          (topicId) => topicRelationships[topicId]?.domain_ids ?? [],
        ),
      ),
    ];
    service.skill_ids = [
      ...new Set(
        service.topic_ids.flatMap(
          (topicId) => topicRelationships[topicId]?.skill_ids ?? [],
        ),
      ),
    ];
  }
  for (const topic of topics) {
    topic.service_ids = services
      .filter((service) => service.topic_ids.includes(topic.id))
      .map((service) => service.id);
  }
  for (const skill of skills) {
    skill.service_ids = services
      .filter((service) => service.topic_ids.includes(skill.topic_id))
      .map((service) => service.id);
  }
  for (const lab of labs) {
    lab.domain_ids = [
      ...new Set(
        lab.topic_ids.flatMap(
          (topicId) => topicRelationships[topicId]?.domain_ids ?? [],
        ),
      ),
    ];
    lab.service_ids = [
      ...new Set(
        lab.topic_ids.flatMap(
          (topicId) =>
            topics.find((topic) => topic.id === topicId)?.service_ids ?? [],
        ),
      ),
    ];
  }
  const questions = buildMcqQuestions(topics, services);
  const sources = parseOfficialSources();
  const references = buildReferences();

  const certification = {
    schema_version: SCHEMA_VERSION,
    content_version: "2026.07.23-2",
    id: "aws-aip-c01",
    code: "AIP-C01",
    title: "AWS Certified Generative AI Developer - Professional",
    status: "active-study-blueprint",
    question_count: 75,
    scored_question_count: 65,
    unscored_question_count: 10,
    duration_minutes: 180,
    total_questions: 75,
    scored_questions: 65,
    unscored_questions: 10,
    passing_scaled_score: 750,
    score_scale: { minimum: 100, maximum: 1000 },
    scaled_score_minimum: 100,
    scaled_score_maximum: 1000,
    target_unseen_practice_percent: 85,
    question_formats: ["multiple-choice", "multiple-response"],
    domain_ids: domains.map((domain) => domain.id),
    coverage: {
      domains: domains.length,
      tasks: tasks.length,
      skills: skills.length,
      scope_entries: services.length,
    },
    caveats: [
      "The official content outline is non-exhaustive and can change.",
      "Importance labels guide revision depth; they do not claim exact question probability.",
      "Model support, Regions, quotas, limits, and pricing must be rechecked before production use.",
      "An 85% unseen-practice target is a safety margin, not a conversion to the AWS scaled score.",
    ],
    importance_rubric: {
      warning:
        "Importance is a revision-order aid, not a claim about exact question probability.",
      formula:
        "35% linked domain weight + 30% official skill density + 20% local practice frequency + 15% decision density",
      labels: {
        critical: "Master implementation, decisions, failures, and tradeoffs.",
        high: "Master architecture choices and common failure boundaries.",
        supporting: "Know operational role and important comparisons.",
        recognition: "Recognize purpose and eliminate distractors.",
      },
    },
    source_title: "Official AIP-C01 exam guide",
    source_url: OFFICIAL_GUIDE_URL,
    verified_at: VERIFIED_AT,
    sources: [
      {
        title: "Official AIP-C01 exam guide",
        url: OFFICIAL_GUIDE_URL,
        publisher: "AWS",
        verified_at: VERIFIED_AT,
      },
      {
        title: "AWS Certified Generative AI Developer - Professional exam overview",
        url: "https://aws.amazon.com/certification/certified-generative-ai-developer-professional/",
        publisher: "AWS",
        verified_at: VERIFIED_AT,
      },
    ],
  };

  const data = {
    certification,
    domains,
    tasks,
    skills,
    topics,
    services,
    labs,
    sourcePractice,
    questions,
    sources,
    references,
  };
  validate(data);

  const nestedDomains = domains.map((domain) => ({
    ...domain,
    tasks: tasks
      .filter((task) => task.domain_id === domain.id)
      .map((task) => ({
        ...task,
        skills: skills.filter((skill) => skill.task_id === task.id),
      })),
  }));

  certification.counts = {
    domains: domains.length,
    tasks: tasks.length,
    skills: skills.length,
    topics: topics.length,
    services: services.length,
    labs: labs.length,
    questions: questions.length,
    source_recall_cards: sourcePractice.recall.length,
    source_scenario_cards: sourcePractice.scenarios.length,
    source_trap_cards: sourcePractice.traps.length,
    official_sources: sources.length,
  };

  const obsoleteOutputs = [
    "manifest.json",
    "tasks.json",
    "skills.json",
    "practice.json",
    "sources.json",
    "references.json",
  ];
  for (const obsoleteOutput of obsoleteOutputs) {
    const obsoletePath = path.join(OUT_DIR, obsoleteOutput);
    if (fs.existsSync(obsoletePath)) fs.unlinkSync(obsoletePath);
  }

  const files = [];
  files.push(writeJson("certification.json", certification));
  files.push(
    writeJson("domains.json", {
      schema_version: SCHEMA_VERSION,
      verified_at: VERIFIED_AT,
      items: nestedDomains,
    }),
  );
  files.push(
    writeJson("topics.json", {
      schema_version: SCHEMA_VERSION,
      verified_at: VERIFIED_AT,
      items: topics,
    }),
  );
  files.push(
    writeJson("services.json", {
      schema_version: SCHEMA_VERSION,
      verified_at: VERIFIED_AT,
      depth_contract: {
        "1": "implementation",
        "2": "architecture-decision",
        "3": "recognition",
      },
      items: services,
    }),
  );
  files.push(
    writeJson("labs.json", {
      schema_version: SCHEMA_VERSION,
      verified_at: VERIFIED_AT,
      items: labs,
    }),
  );
  files.push(
    writeJson("questions.json", {
      schema_version: SCHEMA_VERSION,
      verified_at: VERIFIED_AT,
      provenance:
        "Original MCQs synthesized from the local AWS-first knowledge base and linked official AWS documentation.",
      redistribution_note:
        "The raw Udemy mock files remain outside public/data and are not read by this generator.",
      counts: {
        total: questions.length,
        single: questions.filter((question) => question.type === "single").length,
        multiple: questions.filter((question) => question.type === "multiple")
          .length,
      },
      items: questions,
    }),
  );

  process.stdout.write(
    `Generated and validated ${files.length} JSON files: ` +
      `${domains.length} domains, ${tasks.length} tasks, ${skills.length} skills, ` +
      `${topics.length} topics, ${services.length} services, ${labs.length} labs, ` +
      `${questions.length} original MCQs.\n`,
  );
}

main();
