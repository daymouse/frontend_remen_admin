import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
  } from "@/components/ui/input-group"
  import { Search as SearchIcon } from "lucide-react"
  
  export default function Search({ value, onChange }) {
    return (
      <InputGroup className="max-w-sm mb-4">
        <InputGroupInput
          placeholder="Cari petugas..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon className="h-4 w-4 text-gray-500" />
        </InputGroupAddon>
      </InputGroup>
    )
  }
  