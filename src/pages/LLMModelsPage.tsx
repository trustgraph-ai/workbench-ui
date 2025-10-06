import React from "react";
import { Bot } from "lucide-react";
import Card from "../components/common/Card";
import LLMModels from "../components/llm-models/LLMModels";

const LLMModelsPage: React.FC = () => {
  return (
    <Card
      title="LLM Models"
      description="Manage LLM model options for parameter types with enum selections"
      icon={<Bot />}
    >
      <LLMModels />
    </Card>
  );
};

export default LLMModelsPage;
