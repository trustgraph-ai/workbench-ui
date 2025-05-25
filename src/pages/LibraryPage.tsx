import React from "react";
import { LibraryBig } from "lucide-react";

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
    </>
  );
};

export default LibraryPage;
