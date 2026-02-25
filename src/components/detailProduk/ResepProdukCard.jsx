import { useEffect, useState } from "react"
import { apiFetch } from "@/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const ResepProdukCard = ({ data, productId }) => {

  const isEditMode = data && data.ingredients

  const [mode, setMode] = useState(isEditMode ? "view" : "form")
  const [ingredientsList, setIngredientsList] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  // fetch dropdown bahan baku
  useEffect(() => {
    fetchBahan()
  }, [])

  const fetchBahan = async () => {
    const res = await apiFetch("/auth/bahan-baku-simpel-list")
    if (res.success) {
      setIngredientsList(res.data)
    }
  }

  // set initial data ketika edit
  useEffect(() => {
    if (isEditMode) {
      setIngredients(data.ingredients)
      setNote(data.note || "")
    }
  }, [data])

  const addRow = () => {
    setIngredients([
      ...ingredients,
      { ingredient_id: "", quantity: "" }
    ])
  }

  const removeRow = (index) => {
    const item = ingredients[index]

    if (item.detail_id) {
      setDeletedIds([...deletedIds, item.detail_id])
    }

    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleChange = (index, field, value) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const formatQty = (qty) => {
    if (!qty) return null

    const number = parseFloat(qty)

    if (number === 0) return null

    return number.toString()
    }

  const handleSubmit = async () => {
    setLoading(true)

    try {

      if (!isEditMode) {
        // CREATE
        await apiFetch("/auth/recep/create", {
          method: "POST",
          body: JSON.stringify({
            product_id: productId,
            note,
            ingredients
          })
        })
      } else {
        // UPDATE
        await apiFetch(`/auth/recep/${productId}`, {
          method: "PUT",
          body: JSON.stringify({
            note,
            deleted_detail_ids: deletedIds,
            ingredients
          })
        })
      }

      window.location.reload()

    } catch (err) {
      alert("Gagal menyimpan resep")
    } finally {
      setLoading(false)
    }
  }

  // ================= VIEW MODE =================
    if (mode === "view") {
        return (
            <Card>
            <CardHeader className="flex justify-between items-center">
                <CardTitle>Resep Produk</CardTitle>
                <Button onClick={() => setMode("form")}>
                Edit
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* NOTE */}
                {data.note && (
                <div className="overflow-hidden">
                    <div
                    className="prose max-w-full break-words"
                    dangerouslySetInnerHTML={{ __html: data.note }}
                    />
                </div>
                )}
                {data.ingredients.map((item) => (
                <div key={item.detail_id} className="flex justify-between">
                    <span>{item.ingredient_name}</span>
                    <span>
                    {formatQty(item.quantity)} {item.satuan_kode}
                    </span>
                </div>
                ))}

            </CardContent>
            </Card>
        )
    }

  // ================= FORM MODE =================
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Resep Produk" : "Buat Resep Produk"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="font-medium mb-2 block">
            Catatan
          </label>
          <ReactQuill value={note} onChange={setNote} />
        </div>
        <div className="space-y-3 ">
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[300px] space-y-2 ">

                {ingredients.map((item, index) => (
                    <div
                    key={index}
                    className="flex items-center gap-3"
                    >
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeRow(index)}
                        className="shrink-0"
                    >
                        X
                    </Button>
                    <div className="flex-1 min-w-[250px]">
                        <Select
                        value={item.ingredient_id?.toString()}
                        onValueChange={(val) =>
                            handleChange(index, "ingredient_id", val)
                        }
                        >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih bahan" />
                        </SelectTrigger>
                        <SelectContent>
                            {ingredientsList.map((bahan) => (
                            <SelectItem
                                key={bahan.id}
                                value={bahan.id.toString()}
                            >
                                {bahan.nama} ({bahan.satuan_kode})
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="w-[150px] shrink-0">
                        <Input
                        type="number"
                        placeholder="Qty"
                        value={formatQty(item.quantity)}
                        onChange={(e) =>
                            handleChange(index, "quantity", e.target.value)
                        }
                        />
                    </div>

                    </div>
                ))}

                </div>
            </div>
        </div>

        <Button onClick={addRow} variant="outline">
          + Tambah Bahan
        </Button>

        {/* NOTE */}
        

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Menyimpan..." : "Simpan Resep"}
        </Button>

      </CardContent>
    </Card>
  )
}

export default ResepProdukCard