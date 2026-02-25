import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const DetailProdukCard = ({ data }) => {
  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Produk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Nama:</strong> {data.nama_produk}</p>
        <p><strong>Harga Normal:</strong> Rp {data.harga_normal}</p>
        <p><strong>Harga Akhir:</strong> Rp {data.harga_akhir}</p>
        <p><strong>Status:</strong> {data.status}</p>
      </CardContent>
    </Card>
  )
}

export default DetailProdukCard