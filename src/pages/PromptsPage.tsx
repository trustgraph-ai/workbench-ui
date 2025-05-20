
import CenterSpinner from '../components/common/CenterSpinner';
import PageHeader from '../components/common/PageHeader';
import PromptTable from '../components/prompts/PromptTable';

const PromptsPage = () => {

  return (
    <>
      <PageHeader
        title="Prompt Management"
        description="TBD"
      />
      <PromptTable/>
      <CenterSpinner/>

    </>

  );

}

export default PromptsPage;

