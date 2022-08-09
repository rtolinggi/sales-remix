import { Button } from "@mantine/core";
import { IconTableExport } from "@tabler/icons";
import * as FileServer from "file-saver";
import * as XLSX from "xlsx";

type PropsData = {
  apiData: Array<{}>;
  fileName: string;
};

export const ExportToExcel: React.FC<PropsData> = ({ apiData, fileName }) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (apiData: any, fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(apiData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileServer.saveAs(data, fileName + fileExtension);
  };

  return (
    <Button
      leftIcon={<IconTableExport size={20} />}
      onClick={() => exportToCSV(apiData, fileName)}>
      Export
    </Button>
  );
};
