import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/server";
import FilterPesananModal from "@/components/pesanan/FilterPesananModal";
import PesananTable from "@/components/Bahanbaku/stokMovement/PesananTable";
import { useParams } from "react-router-dom"
import SummaryBulananCard from "@/components/Bahanbaku/stokMovement/SummaryCard";
import ActiveFilters from "@/components/pesanan/ActiveFilters"
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
  const [filters, setFilters] = useState({
    tanggalAwal: "",
    tanggalAkhir: "",
    hargaMin: "",
    hargaMax: "",
    produkId: "",
    userId: ""
  });
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
            tipe: customFilters.tipe || null,
            reference_type: customFilters.referenceType || null,
            start_date: customFilters.tanggalAwal || null,
            end_date: customFilters.tanggalAkhir || null,
            })
      })

      if (response.status) {
        setPesanan(response.data)
        setPagination(response.pagination)
        setRangeData(response.range)
        setBahan(response.bahan)

        fetchSummary(customFilters)
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
          start_date: customFilters.tanggalAwal || null,
          end_date: customFilters.tanggalAkhir || null,
        }),
      })

      if (response.status) {
        setSummary(response.summary)
      }

    } catch (err) {
      console.error("Gagal ambil summary")
    } finally {
      setSummaryLoading(false)
    }
  }


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

  // Handle filter application
  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);

    setPagination(prev => ({
      ...prev,
      current_page: 1
    }));

    fetchStok(1, newFilters);
};

const handlePrint = () => {
  if (!pesanan.length) return;

  const filterInfo = `
    <div style="margin-bottom:20px; font-size:12px;">
      <strong>Filter Aktif:</strong><br/>
      Tanggal: ${filters.tanggalAwal || "-"} s/d ${filters.tanggalAkhir || "-"} <br/>
      Harga: ${filters.hargaMin || 0} - ${filters.hargaMax || 0} <br/>
      Produk: ${filters.produkId || "-"}
    </div>
  `;

  const tableRows = pesanan.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${formatDate(order.created_at)}</td>
      <td>
        ${order.petugas?.fullname || order.petugas?.username || "-"} <br/>
        <small>${order.petugas?.kelas || ""}</small>
      </td>
      <td style="text-align:center">${order.total_item}</td>
      <td style="text-align:right">${formatCurrency(order.total_harga)}</td>
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
        ${filterInfo}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Petugas</th>
              <th>Total Item</th>
              <th>Total Harga</th>
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

  const data = pesanan.map((order) => ({
    ID: order.id,
    Tanggal: formatDate(order.created_at),
    Petugas: order.petugas?.fullname || order.petugas?.username || "-",
    Kelas: order.petugas?.kelas || "-",
    Total_Item: order.total_item,
    Total_Harga: order.total_harga,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pesanan");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, "Laporan_Pesanan.xlsx");
};

const handleExportWord = async () => {
  if (!pesanan.length) return;

  const headerRow = new TableRow({
    children: [
      "ID",
      "Tanggal",
      "Petugas",
      "Total Item",
      "Total Harga"
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
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph(order.petugas?.fullname || order.petugas?.username || "-"),
            new Paragraph({
              children: [
                new TextRun({
                  text: order.petugas?.kelas || "",
                  size: 18
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun(String(order.total_item))]
            })
          ]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun(formatCurrency(order.total_harga))]
            })
          ]
        }),
      ]
    })
  );

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: "LAPORAN PESANAN",
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
  saveAs(blob, "Laporan_Pesanan.docx");
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

        {/* Content untuk Print */}
        <div ref={reportRef}>
            <SummaryBulananCard
              summary={summary}
              loading={summaryLoading}
              satuan={bahan?.kode_satuan}
            />
            <ActiveFilters
              filters={filters}
              ranges={rangeData}
              onClear={() =>
                handleApplyFilter({
                  tanggalAwal: "",
                  tanggalAkhir: "",
                  hargaMin: "",
                  hargaMax: "",
                  produkId: "",
                  fullname: "",
                  minTerjual: "",
                  maxTerjual: ""
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
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          currentFilters={filters}
          rangeData={rangeData}
        />

      </div>
  )
};

export default StokMovement;