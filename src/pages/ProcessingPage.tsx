import React from "react";
import { CircleArrowRight } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import Processing from "../components/processing/Processing";

const ProcessingPage = () => {
  return (
    <>
      <PageHeader
        icon={<CircleArrowRight />}
        title="Processing"
        description="Submit documents for processing"
      />
      <Processing />
      <CenterSpinner />
    </>
  );
};

export default ProcessingPage;
