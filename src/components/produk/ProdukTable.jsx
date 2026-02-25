"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProdukTable({
  data,
  onEdit,
  onDelete,
  onToggleBestSeller,
}) {
  const navigate = useNavigate();
  return (
   <div className="rounded-lg border bg-background overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Gambar</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Best Seller</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Harga</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/detail-produk/${item.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onToggleBestSeller(item.id)}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        Toggle Best Seller
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.nama_produk}
                      className="h-12 w-12 object-contain rounded-md"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  {item.nama_produk}
                </TableCell>
                <TableCell>
                {item.is_best_seller ? (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                    Best Seller
                    </span>
                ) : (
                    "-"
                )}
                </TableCell>

                <TableCell className="max-w-xs truncate">
                  {item.deskripsi}
                </TableCell>

                <TableCell>
                  {item.id_diskon ? (
                    <div>
                      <p className="font-semibold text-[#622F10]">
                        Rp{" "}
                        {parseFloat(item.harga_final).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm text-gray-400 line-through">
                        Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <p className="font-semibold text-[#622F10]">
                      Rp {parseFloat(item.harga).toLocaleString("id-ID")}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                Produk tidak ditemukan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}