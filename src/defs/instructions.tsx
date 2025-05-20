
import {
  Box, SimpleGrid, Flex, Button, Drawer, Portal, CloseButton, Text,
  Table, Link, Code, List,
} from '@chakra-ui/react';

import { useConfigurationStateStore } from '../state/build/configuration';
import { useVersionStateStore } from '../state/build/version';
import { useOptionsStore } from '../state/build/options';

import ExternalDocs from '../components/common/ExternalDocs';

const reportConfig = () => {

  const config = useConfigurationStateStore.getState();
  const options = useOptionsStore((state) => state.options);
  const selectedVersion = useVersionStateStore(
    (state) => state.selectedVersion
  );

  return {
    "aim": "Info",
    "actions":
      <List.Root>
        <List.Item>Platform: {config.platform}</List.Item>
        <List.Item>Graph store: {config.graphStore}</List.Item>
        <List.Item>Vector store: {config.vectorStore}</List.Item>
        <List.Item>Main LLM platform: {config.mainAi.platform}</List.Item>
        { (config.dualModelMode == true) &&
          <List.Item>RAG LLM platform: {config.ragAi.platform}</List.Item> }
        <List.Item>Chunker: {config.chunkerType}</List.Item>
      </List.Root>
  };

}


export const instructions = {

  "note-config": reportConfig,

  "note-graph-falkordb": {
    aim: "Understand FalkorDB licence",
    actions: "FIXME: Document FalkorDB licence",
  },

  "prepare-platform-docker-compose": {
    aim: "Install Docker Compose",
    actions: (
      <Text>You need to have Docker and <Code>docker-compose</Code>
      Docker Compose installed.
      See <ExternalDocs href="https://docs.docker.com/compose/install/">
      Installing Docker Compose</ExternalDocs>.</Text>
    )
  },
  "prepare-platform-podman-compose": {
    aim: "Install Podman Compose",
    actions: (
      <Text>
      You need to have Podman and <Code>podman-compose</Code>
      installed.
      See <ExternalDocs href="https://linuxhandbook.com/podman-compose/">
      Installing Podman Compose
      </ExternalDocs>.</Text>
    ),
  },
  "prepare-platform-minikube-k8s": {
    aim: "Prepare Minikube",
    actions: (
      <Text>
        See documentation for Minikube:{' '}
        <ExternalDocs href="https://minikube.sigs.k8s.io/docs/start">
        Minikube - Get Started
        </ExternalDocs>.  There is TrustGraph documentation on
        Minikube <ExternalDocs href="https://trustgraph.ai/docs/running/minikube">here</ExternalDocs>.
        </Text>
    ),
  },
  "prepare-platform-gcp-k8s": {
      aim: "Prepare Google Cloud",
      actions: (
        <Text>
          You need to have a Google Cloud account, and a
          running GKE cluster.  You also need to be authenticated
          with the cluster and be able to see the cluster
          state.
          See <ExternalDocs href="https://cloud.google.com/kubernetes-engine"
          >Google Kubernetes Engine (GKE)</ExternalDocs>.
        </Text>
    ),
  },
  "prepare-platform-aks-k8s": {
      aim: "Prepare Azure AKS",
      actions: (
        <Text>
FIXME
        </Text>
    ),
  },




  "prepare-compose-vector-pinecone": {
      aim: "Prepare Pineconce secret",
      actions: (
        <Text>
          FIXME: Pinecone secret on compose
        </Text>
    ),
  },

  "prepare-k8s-vecttor-pinecone": {
      aim: "Prepare Pineconce secret",
      actions: (
        <Text>
          FIXME: Pinecone secret on k8s
        </Text>
    ),
  },



  "prepare-compose-llm-azure": {
      aim: "Prepare Azure LLM",
      actions: (
        <Text>
          FIXME: Azure LLM on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-azure": {
      aim: "Prepare Azure",
      actions: (
        <Text>
          FIXME: Azure LLM on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-azure-openai": {
      aim: "Prepare Azure OpenAI LLM",
      actions: (
        <Text>
          FIXME: Azure openai on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-azure-openai": {
      aim: "Prepare AzureOepnAI ",
      actions: (
        <Text>
          FIXME: Az OpenAI on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-bedrock": {
      aim: "Prepare Bedrock",
      actions: (
        <Text>
          FIXME: Bedrock on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-bedrock": {
      aim: "Prepare Bedrock",
      actions: (
        <Text>
          FIXME: Bedrock on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-claude": {
      aim: "Prepare claude",
      actions: (
        <Text>
          FIXME: Claude on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-claude": {
      aim: "Prepare Claude",
      actions: (
        <Text>
          FIXME: Claaude on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-cohere": {
      aim: "Prepare Cohere",
      actions: (
        <Text>
          FIXME: Cohere on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-cohere": {
      aim: "Prepare Cohere",
      actions: (
        <Text>
          FIXME: Cohere on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-googleaistudio": {
      aim: "Prepare GAIS",
      actions: (
        <Text>
          FIXME: GAIS on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-googleaistudio": {
      aim: "Prepare GAIS",
      actions: (
        <Text>
          FIXME: GAIS on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-llamafile": {
      aim: "Prepare llamafile",
      actions: (
        <Text>
          FIXME: llamafile on Compopse
        </Text>
    ),
  },
  "prepare-k8s-llm-llamafile": {
      aim: "Prepare llamafile",
      actions: (
        <Text>
          FIXME: llamafile on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-lmstudio": {
      aim: "Prepare lmstudio",
      actions: (
        <Text>
          FIXME: Ollama on lmstudio
        </Text>
    ),
  },
  "prepare-k8s-llm-lmstudio": {
      aim: "Prepare lmstudio",
      actions: (
        <Text>
          FIXME: lmstudio on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-mistral": {
      aim: "Prepare mistral",
      actions: (
        <Text>
          FIXME: mistral on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-mistral": {
      aim: "Prepare mistral",
      actions: (
        <Text>
          FIXME: mistral on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-ollama": {
      aim: "Prepare Ollama",
      actions: (
      <>
        <Text>
           The power of Ollama is the flexibility it provides in
           Language Model deployments. Being able to run LMs with
           Ollama enables fully secure AI TrustGraph pipelines
           that aren't relying on any external APIs. No data is
           leaving the host environment or network.
        </Text>
        <Text mt={2}>
           The Ollama service must be running, and have required
           models available using <Code>ollama pull</Code>.
           The Ollama service URL must be provided in an environment
           variable.
        </Text>
        <Code mt={2}>
           OLLAMA_HOST=http://ollama-host:11434
        </Code>
        <Text mt={2}>
           Replace the URL with the URL of your Ollama service.
        </Text>
      </>
    ),
  },
  "prepare-k8s-llm-ollama": {
      aim: "Prepare Ollama",
      actions: (
      <>
        <Text>
           The power of Ollama is the flexibility it provides in
           Language Model deployments. Being able to run LMs with
           Ollama enables fully secure AI TrustGraph pipelines
           that aren't relying on any external APIs. No data is
           leaving the host environment or network.
        </Text>
        <Text mt={2}>
           The Ollama service must be running, and have required
           models available using <Code>ollama pull</Code>.
           The Ollama service URL must be provided in an environment
           variable.
        </Text>
        <Code mt={2}>
            kubectl -n trustgraph \<br/>
            {'    '}create secret generic ollama-credentials \<br/>
            {'    '}--from-literal=ollama-host=<span className="variable">http://ollama:11434/</span>
        </Code>
        <Text mt={2}>
           Replace the URL with the URL of your Ollama service.
        </Text>
      </>
    ),
  },

  "prepare-compose-llm-openai": {
      aim: "Prepare Openai",
      actions: (
        <Text>
          FIXME: openai on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-openai": {
      aim: "Prepare openai",
      actions: (
        <Text>
          FIXME: openai on k8s
        </Text>
    ),
  },

  "prepare-compose-llm-vertexai": {
      aim: "Prepare vertexai",
      actions: (
        <Text>
          FIXME: vertexai on Compose
        </Text>
    ),
  },
  "prepare-k8s-llm-vertexai": {
      aim: "Prepare vertexai",
      actions: (
        <Text>
          FIXME: vertexai on k8s
        </Text>
    ),
  },



  "deploy-platform-docker-compose": {
      aim: "Deploy using compose",
      actions: (
        <Text>
FIXME
        </Text>
    ),
  },

  "deploy-platform-podman-compose": {
      aim: "Deploy using compose",
      actions: (
        <Text>
FIXME
        </Text>
    ),
  },

  "deploy-compose-docker-compose-application": {
      aim: "Deploy docker-compose application ",
      actions: (
        <Text>
FIXME application
        </Text>
    ),
  },

  "deploy-compose-podman-compose-application": {
      aim: "Deploy application",
      actions: (
      <>
        <Text>
          To deploy to Kubernetes, you need to have Kubernetes
          credentials set up to connect to the Kubernetes management
          service.  The mechanism to do this varies with the different
          kinds of Kubernetes services in use, check with your cloud
          provider documentation.
        </Text>
        <Text>
          When you download the deploy configuration, you will
          have a ZIP file containing all the configuration
          needed to launch TrustGraph on Kubernetes.
          Unzip the ZIP file...
        </Text>
        <Code mt={2}>
          kubectl -n trustgraph create secret \<br/>
          {'    '}generic gateway-secret \<br/>
          {'    '}--from-literal=gateway-secret=
        </Code>
        <Text mt={2}>
           Replace the URL with the URL of your Ollama service.
        </Text>
      </>
    ),
  },

  "deploy-k8s-application": {
      aim: "Deploy application",
      actions: (
      <>
        <Text>
          To deploy to Kubernetes, you likely need to have Kubernetes
          credentials set up to connect to the Kubernetes management
          service.  The mechanism to do this varies with the different
          kinds of Kubernetes services in use, check with your cloud
          provider documentation.
        </Text>
        <Text mt={2}>
          When you download the deploy configuration, you will
          have a ZIP file containing all the configuration
          needed to launch TrustGraph on Kubernetes.
          Unzip the ZIP file...
        </Text>
        <Code mt={2}>
          unzip deploy.zip
        </Code>
        <Text mt={2}>
          and launch...
        </Text>
        <Code mt={2}>
          kubectl apply -f resources.yaml
        </Code>
      </>
    ),
  },

  "finalise-opt-set-configure-document-rag": {
      aim: "Document RAG",
      actions: (
        <>
          <Text>
            Document RAG APIs are separate from GraphRAG.
            You can use the <Code>tg-invoke-document-rag</Code> to test
            Document RAG processing once documents are loaded:
          </Text>
          <Code>
            tg-invoke-document-rag -q "Describe a cat"
          </Code>
        </>
    ),
  },


  "prepare-compose-gateway": {
      aim: "Gateway",
      actions: (
        <Text>
Gateway on compose
        </Text>
    ),
  },


  "prepare-k8s-gateway": {
      aim: "Prepare API gateway",
      actions: (
      <>
        <Text>
          The API Gateway is a required component which supports the CLI
          and Test Suite. The API Gateway must be configured with a
          secret key. However, that secret key can be empty if no
          authentication is required. The Test Suite does not currently
          use keys for authentication. The below example shows how to
          set the API Gateway secret to be empty with no authentication.
        </Text>
        <Text>
          <Code mt={2}>
            kubectl -n trustgraph create secret \<br/>
            generic gateway-secret \<br/>
            --from-literal=gateway-secret=
          </Code>
        </Text>
        <Text mt={2}>
           Replace the URL with the URL of your Ollama service.
        </Text>
      </>
    ),
  },

  "finalise-opt-set-configure-workbench": {
      aim: "Workbench",
      actions: (
      <>
        <Text>
          Once the system is running, you can access the
          Test Suite on port 8888, or access using the
          following URL:
        </Text>
        <Text>
          <ExternalDocs href="http://localhost:8888">
              <Code>http://localhost:8888/</Code>
          </ExternalDocs>
        </Text>
        <Text mt={2}>
          Once you have data loaded, you can present a
          Graph RAG query on the Chat tab.  As well as
          answering the question, a list of semantic relationships
          which were used to answer the question are shown
          and these can be used to navigate the knowledge
          graph.
        </Text>
      </>
    ),
  },

  "finalise-opt-unset-configure-workbench": {
      aim: "Workbench",
      actions: (
        <Text>
No workbench selected
        </Text>
    ),
  },

};
