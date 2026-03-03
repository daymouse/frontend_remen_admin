import { useEffect, useState, useRef } from "react"
import { apiFetch } from "@/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import IngredientDropdown from "@/components/detailProduk/components/IngredientDropdown"

const ResepProdukCard = ({ data, productId }) => {

  const isEditMode = data && data.ingredients

  const [mode, setMode] = useState(isEditMode ? "view" : "form")
  const [ingredientsList, setIngredientsList] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [deletedIds, setDeletedIds] = useState([])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const debounceRef = useRef(null)
  const [packagingList, setPackagingList] = useState([])
  const [packagings, setPackagings] = useState([])
  const [deletedPackagingIds, setDeletedPackagingIds] = useState([])


  const fetchBahan = async () => {
    const res = await apiFetch("/api/bahan-simpel-list")

    if (res.success) {
      setIngredientsList(res.data)
    }
  }
  const fetchPackaging = async () => {
    const res = await apiFetch(`/api/bahan-simpel-list-packaging`)

    if (res.success) {
      setPackagingList(res.data)
    }
  }
  useEffect(() => {
    fetchBahan()
    fetchPackaging()
  }, [])

  useEffect(() => {
    if (isEditMode) {
      setIngredients(data.ingredients || [])
      setPackagings(data.packagings || [])
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
    if (!qty) return ""
    const number = parseFloat(qty)

    if (number === 0) return null

    return number.toString()
    }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      await apiFetch("/api/recep/save", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          note,
          ingredients,
          packagings,
          deleted_detail_ids: deletedIds,
          deleted_packaging_ids: deletedPackagingIds
        })
      })

      window.location.reload()

    } catch (err) {
      alert("Gagal menyimpan resep")
    } finally {
      setLoading(false)
    }
  }

  const addPackagingRow = () => {
    setPackagings([
      ...packagings,
      { ingredient_id: "", quantity: "" }
    ])
  }

  const removePackagingRow = (index) => {
    const item = packagings[index]

    if (item.detail_id) {
      setDeletedPackagingIds([
        ...deletedPackagingIds,
        item.detail_id
      ])
    }

    setPackagings(packagings.filter((_, i) => i !== index))
  }

  const handlePackagingChange = (index, field, value) => {
    const updated = [...packagings]
    updated[index][field] = value
    setPackagings(updated)
  }
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
                <h3 className="font-semibold">Catatan</h3>
                {data.note && (
                <div className="overflow-hidden">
                    <div
                    className="prose max-w-full break-words"
                    dangerouslySetInnerHTML={{ __html: data.note }}
                    />
                </div>
                )}
                <hr className="my-4" />
                <h3 className="font-semibold">Bahan</h3>
                {data.ingredients.map((item) => (
                <div key={item.detail_id} className="flex justify-between">
                    <span>{item.ingredient_name}</span>
                    <span>
                    {formatQty(item.quantity)} {item.satuan_kode}
                    </span>
                </div>
                ))}
                {data.packagings?.length > 0 && (
                  <>
                    <hr className="my-4" />
                    <h3 className="font-semibold">Packaging</h3>
                    {data.packagings.map((item) => (
                      <div key={item.detail_id} className="flex justify-between">
                        <span>{item.ingredient_name}</span>
                        <span>
                          {formatQty(item.quantity)} {item.satuan_kode}
                        </span>
                      </div>
                    ))}
                  </>
                )}

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
        <div className="space-y-3">
          <h3 className="font-semibold">Bahan Baku</h3>

          {ingredients.map((item, index) => (
            <div key={index} className="flex items-center gap-3">

              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeRow(index)}
              >
                X
              </Button>

              <div className="flex-1">
                <IngredientDropdown
                  value={item.ingredient_id}
                  setValue={(val) =>
                    handleChange(index, "ingredient_id", val)
                  }
                  list={ingredientsList}
                />
              </div>

              <div className="w-[120px] relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-10"
                  value={formatQty(item.quantity)}
                  onChange={(e) =>
                    handleChange(index, "quantity", e.target.value)
                  }
                />

                {item.ingredient_id && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {
                      ingredientsList.find(
                        (i) =>
                          String(i.id) ===
                          String(item.ingredient_id)
                      )?.satuan_kode
                    }
                  </span>
                )}
              </div>

            </div>
          ))}

          {/* BUTTON TAMBAH */}
          <Button
            variant="outline"
            size="icon"
            onClick={addRow}
          >
            +
          </Button>
        </div> 
        <hr className="my-6 border-t" />
        <div className="space-y-3">
          <h3 className="font-semibold">Packaging</h3>

          {packagings.map((item, index) => (
            <div key={index} className="flex items-center gap-3">

              <Button
                variant="destructive"
                size="icon"
                onClick={() => removePackagingRow(index)}
              >
                X
              </Button>

              <div className="flex-1">
                <IngredientDropdown
                  value={item.ingredient_id}
                  setValue={(val) =>
                    handlePackagingChange(
                      index,
                      "ingredient_id",
                      val
                    )
                  }
                  list={packagingList}
                />
              </div>

              <div className="w-[120px] relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="pr-10"
                  value={formatQty(item.quantity)}
                  onChange={(e) =>
                    handlePackagingChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                />

                {item.ingredient_id && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {
                      packagingList.find(
                        (i) =>
                          String(i.id) ===
                          String(item.ingredient_id)
                      )?.satuan_kode
                    }
                  </span>
                )}
              </div>

            </div>
          ))}

          {/* BUTTON TAMBAH PACKAGING */}
          <Button
            variant="outline"
            size="icon"
            onClick={addPackagingRow}
          >
            +
          </Button>
        </div>

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