import { MessageCircleCode } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import PromptTable from "../components/prompts/PromptTable";

const PromptsPage = () => {
  return (
    <>
      <PageHeader
        icon={<MessageCircleCode />}
        title="Prompt Management"
        description="Define prompts which control AI interactions"
      />
      <PromptTable />
      <CenterSpinner />
    </>
  );
};

export default PromptsPage;
