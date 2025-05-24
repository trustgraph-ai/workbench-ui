import React from "react";
import { LibraryBig } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import Documents from "../components/library/Documents";

const LibraryPage = () => {
  return (
    <>
      <PageHeader
        icon={<LibraryBig />}
        title="Library"
        description="Managing loaded documents"
      />
      <Documents />
      <CenterSpinner />
    </>
  );
};

export default LibraryPage;
