import { MessageCircleCode } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import Prompts from "../components/prompts/Prompts";

const PromptsPage = () => {
  return (
    <>
      <PageHeader
        icon={<MessageCircleCode />}
        title="Prompt Management"
        description="Define prompts which control AI interactions"
      />
      <Prompts />
      <CenterSpinner />
    </>
  );
};

export default PromptsPage;
