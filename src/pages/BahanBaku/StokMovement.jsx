import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/server";
import FilterPesananModal from "@/components/Bahanbaku/stokMovement/Filter";
import PesananTable from "@/components/Bahanbaku/stokMovement/PesananTable";
import { useParams } from "react-router-dom"
import SummaryBulananCard from "@/components/Bahanbaku/stokMovement/SummaryCard";
import ActiveFilters from "@/components/Bahanbaku/stokMovement/ActiveFilters"
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


const StokMovement = () => {
      const { id } = useParams()
      
  const [pesanan, setPesanan] = useState([]);
  const [bahan, setBahan] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    type: "",
    reference_type: "",
    start_date: "",
    end_date: "",
  })
  const [search, setSearch] = useState("")
  const [perPage, setPerPage] = useState(10)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)


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

      const response = await apiFetch(`/api/stok/${id}`, {
        method: "POST",
        body: JSON.stringify({
          page,
          per_page: perPage,
          search,
          type: customFilters.type || null,
          reference_type: customFilters.reference_type || null,
          start_date: customFilters.start_date || null,
          end_date: customFilters.end_date || null,
        })
      })

      if (response.status) {
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
  const fetchSummary = async (customFilters = filters) => {
    try {
      setSummaryLoading(true)

      const response = await apiFetch("/api/stok/summary", {
        method: "POST",
        body: JSON.stringify({
          bahan_id: id,
          start_date: customFilters.start_date || null,
          end_date: customFilters.end_date || null,
        }),
      })

      if (response.status) {
        const list = response.summary || []

        const sekarang = list[list.length - 1] || null
        const lalu = list[list.length - 2] || null

        setSummary({
          summary_sekarang: sekarang,
          summary_lalu: lalu
        })
      }

    } catch (err) {
      console.error("Gagal ambil summary")
    } finally {
      setSummaryLoading(false)
    }
  }


useEffect(() => {
  fetchSummary(filters)
}, [id])
useEffect(() => {
  fetchStok(1)
}, [search, perPage])




const handlePageChange = (page) => {
  fetchStok(page)
}


  // Hitung total item terjual
  const totalItemTerjual = pesanan.reduce((total, order) => {
    return total + (order.items?.reduce((sum, item) => sum + (item.jumlah || 0), 0) || 0);
  }, 0);

  // Format currency
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
    const formatNumber = (value) => {
      if (!value) return "0"

      const number = parseFloat(value)
      if (number % 1 === 0) {
        return new Intl.NumberFormat("id-ID", {
          maximumFractionDigits: 0,
        }).format(number)
      }
      return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: 3,
      }).format(number)
    }

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
    fetchSummary(newFilters)
  }

const handlePrint = () => {
  if (!pesanan.length) return;

  const tableRows = pesanan.map(row => `
  <tr>
    <td>${row.id}</td>
    <td>${formatDate(row.created_at)}</td>
    <td>${row.tipe}</td>
    <td>${formatNumber(row.qty)} ${bahan?.kode_satuan || ""}</td>
    <td>${row.reference_id}</td>
    <td>${row.reference_type}</td>
  </tr>
  `).join("");

  const printWindow = window.open("", "", "width=1000,height=700");

  printWindow.document.write(`
    <html>
      <head>
        <title>Laporan Pesanan</title>
        <style>
          body { font-family: Arial; padding: 30px; }
          h2 { margin-bottom: 5px; }
          table { width:100%; border-collapse: collapse; margin-top:20px; }
          th, td { border:1px solid #ddd; padding:8px; font-size:12px; }
          th { background:#f5f5f5; text-align:left; }
        </style>
      </head>
      <body>
        <h2>LAPORAN PESANAN</h2>
        <p>Dicetak: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Qty</th>
              <th>Referensi ID</th>
              <th>Referensi</th>
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
};


const handleExportExcel = () => {
  if (!pesanan.length) return;

  const exportData = pesanan.map((row) => ({
    ID: row.id,
    Tanggal: formatDate(row.created_at),
    Tipe: row.tipe,
    Qty: `${formatNumber(row.qty)} ${bahan?.kode_satuan || ""}`,
    Referensi_ID: row.reference_id,
    Referensi: row.reference_type,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Movement");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Stock_Movement.xlsx");
};

const handleExportWord = async () => {
  if (!pesanan.length) return;

  const headerRow = new TableRow({
    children: [
      "ID",
      "Tanggal",
      "Tipe",
      "Qty",
      "Referensi ID",
      "Referensi",
    ].map(text =>
      new TableCell({
        width: { size: 15, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text,
                bold: true
              })
            ]
          })
        ]
      })
    )
  });

  const dataRows = pesanan.map(order =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph(String(order.id))]
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph(formatDate(order.created_at))]
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph(order.tipe)]
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph(`${formatNumber(order.qty)} ${order.kode_satuan}`)
          ]
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph(order.reference_id)]
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph(order.reference_type)]
        }),
      ]
    })
  );

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "LAPORAN STOK MOVEMENT",
          heading: "Heading1",
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: `Dicetak: ${new Date().toLocaleString()}`,
          alignment: AlignmentType.RIGHT
        }),
        new Paragraph(" "),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          rows: [headerRow, ...dataRows]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Stock_Movement.docx");
};


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan tombol print */}
        <div className="mb-6 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stok Movement</h1>
            <p className="text-gray-600">Data Pergerakan Stok  {bahan?.nama}</p>
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

        {/* Content untuk Print */}
        <div ref={reportRef}>
            <SummaryBulananCard
              data={summary}
              loading={summaryLoading}
              satuan={bahan?.kode_satuan}
            />
            <ActiveFilters
              filter={filters}
              onClear={() =>
                handleApplyFilter({
                  type: "",
                  reference_type: "",
                  start_date: "",
                  end_date: "",
                })
              }
            />

            <PesananTable
              bahan={bahan}
              data={pesanan}
              loading={loading}
              pagination={{ ...pagination, per_page: perPage }}
              onPageChange={handlePageChange}
              setPage={setPage}
              onSearchChange={setSearch}
              onPerPageChange={setPerPage}
              onRowClick={handlePesananClick}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
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
          onClose={setShowFilterModal}
          onApply={handleApplyFilter}
          currentFilter={filters}
        />

      </div>
  )
};

export default StokMovement;