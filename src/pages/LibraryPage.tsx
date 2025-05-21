import React from "react";
import { LibraryBig } from "lucide-react";

import CenterSpinner from "../components/common/CenterSpinner";
import PageHeader from "../components/common/PageHeader";
import DocumentTable from "../components/library/DocumentTable";

const LibraryPage = () => {
  return (
    <>
      <PageHeader
        icon={<LibraryBig />}
        title="Library"
        description="Managing loaded documents"
      />
      <DocumentTable />
      <CenterSpinner />
    </>
  );
};

export default LibraryPage;
