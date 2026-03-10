import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/server";
import FilterPesananModal from "@/components/Bahanbaku/HistoryAsynStok/Filter";
import PesananTable from "@/components/Bahanbaku/HistoryAsynStok/Table";
import { useParams } from "react-router-dom"
import ActiveFilters from "@/components/Bahanbaku/HistoryAsynStok/ActiveFilters"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import DetailPesananModal from "@/components/pesanan/DetailPesananModal"
import { Button } from "@/components/ui/button"
import { MoreVertical, Printer, Filter } from "lucide-react"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType
} from "docx";


const HistoryAsynStok = () => {
      const { id } = useParams()
      
  const [pesanan, setPesanan] = useState([]);
  const [bahan, setBahan] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: ""
  })
  const perPageOptions = [10, 20, 30, 40, 50]
  
  const [perPage, setPerPage] = useState(perPageOptions[0])
  const [search, setSearch] = useState("")
  const [summary, setSummary] = useState(null)


  const reportRef = useRef(null);

const [pagination, setPagination] = useState({
  current_page: 1,
  per_page: 10,
  total_pages: 1,
  total_data: 0
})

const [rangeData, setRangeData] = useState({
  harga: { min: 0, max: 0 },
  item_terjual: { min: 0, max: 0 }
})

  const fetchStok = async (page = 1, customFilters = filters) => {
    try {
      setLoading(true)

      const response = await apiFetch(`/api/stok/list-stok/${id}`, {
        method: "POST",
        body: JSON.stringify({
          page,
          per_page: perPage,
          search,
          start_date: customFilters.start_date || null,
          end_date: customFilters.end_date || null,
        })
      })

      if (response.success) {
        setPesanan(response.data)
        setPagination(response.pagination)
        setRangeData(response.range)
        setBahan(response.bahan)
      }
    } catch (err) {
      setError("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
  fetchStok(1)
}, [search, perPage])




const handlePageChange = (page) => {
  fetchStok(page)
}

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date only (without time)
  const formatDateOnly = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle pesanan click
  const handlePesananClick = (order) => {
    setSelectedPesanan(order);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPesanan(null);
  };

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters)

    setPagination(prev => ({
      ...prev,
      current_page: 1
    }))

    fetchStok(1, newFilters)
  }

  const handlePrint = () => {
    if (!pesanan.length) return;

    const filterInfo = `
      <div style="margin-bottom:20px; font-size:12px;">
        <strong>Filter Aktif:</strong><br/>
        Tanggal: ${filters.start_date || "-"} s/d ${filters.end_date || "-"}
      </div>
    `;

    const tableRows = pesanan.map(row => `
      <tr>
        <td>${row.id}</td>
        <td>${formatDate(row.synced_at)}</td>
        <td>${row.stok_sistem}</td>
        <td>${row.stok_real}</td>
        <td>${row.selisih}</td>
        <td>${row.selisih_persen}%</td>
        <td>${row.petugas_fullname || "-"}</td>
      </tr>
    `).join("");

    const printWindow = window.open("", "", "width=1000,height=700");

    printWindow.document.write(`
      <html>
        <head>
          <title>Riwayat Sinkron Stok</title>
          <style>
            body { font-family: Arial; padding: 30px; }
            h2 { margin-bottom: 5px; }
            table { width:100%; border-collapse: collapse; margin-top:20px; }
            th, td { border:1px solid #ddd; padding:8px; font-size:12px; }
            th { background:#f5f5f5; text-align:left; }
          </style>
        </head>
        <body>
          <h2>RIWAYAT SINKRON STOK</h2>
          <p>Dicetak: ${new Date().toLocaleString()}</p>
          ${filterInfo}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Stok Sistem</th>
                <th>Stok Real</th>
                <th>Selisih</th>
                <th>Selisih %</th>
                <th>Petugas</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  }


  const handleExportExcel = () => {
    if (!pesanan.length) return;

    const data = pesanan.map(row => ({
      ID: row.id,
      Tanggal: formatDate(row.synced_at),
      Stok_Sistem: row.stok_sistem,
      Stok_Real: row.stok_real,
      Selisih: row.selisih,
      Selisih_Persen: row.selisih_persen,
      Petugas: row.petugas_fullname || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 25 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Sinkron Stok");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Riwayat_Sinkron_Stok.xlsx");
  }

  const handleExportWord = async () => {
    if (!pesanan.length) return;

    const headerRow = new TableRow({
      children: [
        "ID",
        "Tanggal",
        "Stok Sistem",
        "Stok Real",
        "Selisih",
        "Selisih %",
        "Petugas"
      ].map(text =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, bold: true })]
            })
          ]
        })
      )
    });

    const dataRows = pesanan.map(row =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(row.id))] }),
          new TableCell({ children: [new Paragraph(formatDate(row.synced_at))] }),
          new TableCell({ children: [new Paragraph(String(row.stok_sistem))] }),
          new TableCell({ children: [new Paragraph(String(row.stok_real))] }),
          new TableCell({ children: [new Paragraph(String(row.selisih))] }),
          new TableCell({ children: [new Paragraph(row.selisih_persen + "%")] }),
          new TableCell({ children: [new Paragraph(row.petugas_fullname || "-")] })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: "RIWAYAT SINKRON STOK",
            heading: "Heading1",
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `Dicetak: ${new Date().toLocaleString()}`,
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph(" "),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Riwayat_Sinkron_Stok.docx");
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan tombol print */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Pesanan</h1>
            <p className="text-gray-600">Daftar semua pesanan yang telah dilaporkan</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">

                <DropdownMenuItem
                  onClick={() => setShowFilterModal(true)}
                  className="cursor-pointer"
                >
                  Filter
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    disabled={pesanan.length === 0}
                    className="cursor-pointer"
                  >
                    Export
                  </DropdownMenuSubTrigger>

                  <DropdownMenuSubContent className="w-40">
                    <DropdownMenuItem
                      onClick={handlePrint}
                      className="cursor-pointer"
                    >
                      Print
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleExportExcel}
                      className="cursor-pointer"
                    >
                      Excel (.xlsx)
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleExportWord}
                      className="cursor-pointer"
                    >
                      Word (.docx)
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div ref={reportRef}>
            <ActiveFilters
              filter={filters}
              onClear={() =>
                handleApplyFilter({
                 start_date: "",
                 end_date:""
                })
              }
            />

            <PesananTable
              bahan={bahan}
              data={pesanan}
              loading={loading}
              pagination={{ ...pagination, per_page: perPage }}
              onPageChange={handlePageChange}
              onSearchChange={setSearch}
              onPerPageChange={setPerPage}
              onRowClick={handlePesananClick}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              perPageOptions= {perPageOptions}
            />
          </div>
        </div>
        <DetailPesananModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          data={selectedPesanan}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        <FilterPesananModal
          open={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilter}
          currentFilter={filters}
        />

      </div>
  )
};

export default HistoryAsynStok;