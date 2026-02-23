import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { NavLink } from "react-router-dom";

export default function ActionMenu({
  setOpenFilter,
  handleExportExcel,
  handlePrintDoc,
  setOpenKomisi,
  handlePrint
}) {
  return (
    <>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          Export
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={handlePrint}>
            Print
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExportExcel}>
            Excel (.xlsx)
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrintDoc}>
            Word (.docx)
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuItem onClick={() => setOpenKomisi(true)}>
        Setting Komisi
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <NavLink to="/dashboard/riwayat-komisi">
          Riwayat Pencairan
        </NavLink>
      </DropdownMenuItem>
    </>
  );
}
