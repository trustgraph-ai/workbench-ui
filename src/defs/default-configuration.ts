
import { ConfigurationState } from '../state/build/configuration';
import { Prompts } from '../state/build/prompts';
import { Agents } from '../state/build/agents';
import {
  SavedConfiguration, SavedConfigurationMap, PackagedConfiguration
} from '../state/build/saved-config';

const config1 : ConfigurationState = {
  "graphStore": "neo4j",
  "vectorStore": "pinecone",
  "chunkerType": "chunker-recursive",
  "chunkSize":1255,
  "chunkOverlap":80,
  "platform": "gcp-k8s",
  "dualModelMode":false,
  "mainAi":{
    "platform": "googleaistudio",
    "modelName": "gemini-2.0-flash-001",
    "temperature":0.1,
    "maxOutputTokens":2048
  },
  "ragAi":{
    "platform": "ollama",
    "modelName": "gemma2:9b",
    "temperature":0.3,
    "maxOutputTokens":2048
  },
  "ocrEngine": "",
  "embeddingsEngine": "",
  "embeddingsModel": ""
};

const prompts : Prompts = {
  "prompts": [
    {
      "id": "system-template",
      "name": "LLM System",
      "prompt": "You are a helpful assistant that performs NLP, Natural Language Processing, tasks.\n",
      "custom": false
    },
    {
      "id": "extract-definitions",
      "name": "Extract Definitions",
      "prompt":"Study the following text and derive definitions for any discovered entities. Do not provide definitions for entities whose definitions are incomplete or unknown. Output relationships in JSON format as an array of objects with keys:\n- entity: the name of the entity\n- definition: English text which defines the entity\n\nHere is the text:\n{{text}}\n\nRequirements:\n- Do not provide explanations.\n- Do not use special characters in the response text.\n- The response will be written as plain text.\n- Do not include null or unknown definitions.\n- The response shall use the following JSON schema structure:\n\n```json\n[{\"entity\": string, \"definition\": string}]\n```",
      "custom": false
    },
    {
      "id": "extract-relationships",
      "name": "Extract Relationships",
      "prompt": "Study the following text and derive entity relationships.  For each relationship, derive the subject, predicate and object of the relationship. Output relationships in JSON format as an array of objects with keys:\n- subject: the subject of the relationship\n- predicate: the predicate\n- object: the object of the relationship\n- object-entity: FALSE if the object is a simple data type and TRUE if the object is an entity\n\nHere is the text:\n{{text}}\n\nRequirements:\n- You will respond only with well formed JSON.\n- Do not provide explanations.\n- Respond only with plain text.\n- Do not respond with special characters.\n- The response shall use the following JSON schema structure:\n\n```json\n[{\"subject\": string, \"predicate\": string, \"object\": string, \"object-entity\": boolean}]\n```\n",
      "custom":false
    },
    {
      "id": "extract-topics",
      "name": "Extract Topics",
      "prompt":"Read the provided text carefully. You will identify topics and their definitions found in the provided text. Topics are intangible concepts.\n\nReading Instructions:\n- Ignore document formatting in the provided text.\n- Study the provided text carefully for intangible concepts.\n\nHere is the text:\n{{text}}\n\nResponse Instructions: \n- Do not respond with special characters.\n- Return only topics that are concepts and unique to the provided text.\n- Respond only with well-formed JSON.\n- The JSON response shall be an array of objects with keys \"topic\" and \"definition\". \n- The response shall use the following JSON schema structure:\n\n```json\n[{\"topic\": string, \"definition\": string}]\n```\n\n- Do not write any additional text or explanations.",
      "custom":false
    },
    {
      "id": "extract-rows",
      "name": "Extract Rows",
      "prompt": "<instructions>\nStudy the following text and derive objects which match the schema provided.\n\nYou must output an array of JSON objects for each object you discover\nwhich matches the schema.  For each object, output a JSON object whose fields\ncarry the name field specified in the schema.\n</instructions>\n\n<schema>\n{{schema}}\n</schema>\n\n<text>\n{{text}}\n</text>\n\n<requirements>\nYou will respond only with raw JSON format data. Do not provide\nexplanations. Do not add markdown formatting or headers or prefixes.\n</requirements>",
      "custom":false
    },
    {
      "id":"kg-prompt",
      "name":"Knowledge Graph Query","prompt":"Study the following set of knowledge statements. The statements are written in Cypher format that has been extracted from a knowledge graph. Use only the provided set of knowledge statements in your response. Do not speculate if the answer is not found in the provided set of knowledge statements.\n\nHere's the knowledge statements:\n{% for edge in knowledge %}({{edge.s}})-[{{edge.p}}]->({{edge.o}})\n{%endfor%}\n\nUse only the provided knowledge statements to respond to the following:\n{{query}}\n",
      "custom":false
    },
    {
      "id":"document-prompt",
      "name":"Document Query","prompt":"Study the following context. Use only the information provided in the context in your response. Do not speculate if the answer is not found in the provided set of knowledge statements.\n\nHere is the context:\n{{documents}}\n\nUse only the provided knowledge statements to respond to the following:\n{{query}}\n",
      "custom":false
    },
    {
      "id":"agent-react",
      "name":"ReAct Agent Router","prompt":"Answer the following questions as best you can. You have\naccess to the following functions:\n\n{% for tool in tools %}{\n    \"function\": \"{{ tool.name }}\",\n    \"description\": \"{{ tool.description }}\",\n    \"arguments\": [\n{% for arg in tool.arguments %}        {\n            \"name\": \"{{ arg.name }}\",\n            \"type\": \"{{ arg.type }}\",\n            \"description\": \"{{ arg.description }}\",\n        }\n{% endfor %}\n    ]\n}\n{% endfor %}\n\nYou can either choose to call a function to get more information, or\nreturn a final answer.\n    \nTo call a function, respond with a JSON object of the following format:\n\n{\n    \"thought\": \"your thought about what to do\",\n    \"action\": \"the action to take, should be one of [{{tool_names}}]\",\n    \"arguments\": {\n        \"argument1\": \"argument_value\",\n        \"argument2\": \"argument_value\"\n    }\n}\n\nTo provide a final answer, response a JSON object of the following format:\n\n{\n  \"thought\": \"I now know the final answer\",\n  \"final-answer\": \"the final answer to the original input question\"\n}\n\nPrevious steps are included in the input.  Each step has the following\nformat in your output:\n\n{\n  \"thought\": \"your thought about what to do\",\n  \"action\": \"the action taken\",\n  \"arguments\": {\n      \"argument1\": action argument,\n      \"argument2\": action argument2\n  },\n  \"observation\": \"the result of the action\",\n}\n\nRespond by describing either one single thought/action/arguments or\nthe final-answer.  Pause after providing one action or final-answer.\n\n{% if context %}Additional context has been provided:\n{{context}}{% endif %}\n\nQuestion: {{question}}\n\nInput:\n    \n{% for h in history %}\n{\n    \"action\": \"{{h.action}}\",\n    \"arguments\": [\n{% for k, v in h.arguments.items() %}        {\n            \"{{k}}\": \"{{v}}\",\n{%endfor%}        }\n    ],\n    \"observation\": \"{{h.observation}}\"\n}\n{% endfor %}",
      "custom":false
    }
  ]
};

const agents : Agents = {
  "tools": [
    {
      "id": "sample-query",
      "name":"Sample query",
      "type": "knowledge-query",
      "config":{},
      "description": "This tool queries a knowledge base that holds information about XYZ.  The question should be a natural language question.",
      "arguments":[
        {
          "name": "question",
          "type": "string",
          "description": "A simple natural language question."
        }
      ]
    },
    {
      "id": "sample-completion",
      "name": "Sample text completion",
      "type": "text-completion",
      "config":{},
      "description": "This tool queries an LLM for further information.  The question should be a natural language question.",
      "arguments":[
        {
          "name": "question",
          "type": "string",
          "description": "The question which should be asked of the LLM."
        }
      ]
    }
  ]
};

const options : string[] = [
  "configure-prompts",
  "configure-agents",
  "configure-document-rag", 
  "configure-embeddings"
];

const config2 : ConfigurationState = {
  "graphStore": "cassandra",
  "vectorStore": "qdrant",
  "chunkerType": "chunker-recursive",
  "chunkSize":1551,
  "chunkOverlap":124,
  "platform": "aws-k8s",
  "dualModelMode":false,
  "mainAi":{
    "platform": "bedrock",
    "modelName": "anthropic.claude-3-5-haiku-20241022-v1:0",
    "temperature":0.15,
    "maxOutputTokens":4096
  },
  "ragAi":{
    "platform": "ollama",
    "modelName": "gemma2:9b",
    "temperature":0.3,
    "maxOutputTokens":2048
  },
 "ocrEngine": "",
 "embeddingsEngine": "",
 "embeddingsModel": ""
};

const all1 : PackagedConfiguration = {
  config: config1,
  prompts: prompts,
  agents: agents,
  options: options,
  version: "0.23.23",
};

const all2 : PackagedConfiguration = {
  config: config2,
  prompts: prompts,
  agents: agents,
  options: options,
  version: "0.22.10",
};

export const defaultConfig : SavedConfigurationMap = {
  "GCP K8s AI Studio": {
    "description": "Google-cloud Kubernets-hosted configuration using Google AI Studio.  Uses Neo4j and Pineone.  0.23.23",
    "config": all1,
  },
  "AWS K8s, Bedrock, Claude": {
    "description": "Deploys TG on AWS Kubernetes with Cassandra for graph storage and Qdrant for vector search, utilizing Claude 3.5 Haiku as its primary AI.  Excellent scalability through distributed databases. 0.22.10",
    "config": all2,
  },
};

