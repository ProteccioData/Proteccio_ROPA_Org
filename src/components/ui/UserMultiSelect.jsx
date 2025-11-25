import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; 
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

export default function UserMultiSelect({ users = [], value = [], onChange }) {
  const [open, setOpen] = useState(false);

  const toggleUser = (user) => {
    const exists = value.find((u) => u.id === user.id);

    if (exists) {
      onChange(value.filter((u) => u.id !== user.id));
    } else {
      onChange([...value, user]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Display selected users as badges */}
      <div className="flex flex-wrap gap-2">
        {value.map((user) => (
          <Badge
            key={user.id}
            className="bg-green-200 text-black flex items-center gap-1"
          >
            {user.name}
            <button
              onClick={() => toggleUser(user)}
              className="text-xs ml-1 text-red-600"
            >
              ✕
            </button>
          </Badge>
        ))}
      </div>

      {/* Combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-full border border-[#828282] dark:border-gray-400 px-3 py-2 rounded-md flex justify-between items-center bg-white dark:bg-gray-700"
            onClick={() => setOpen(true)}
          >
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              {value.length === 0
                ? "Search & select responsible users..."
                : "Add more users"}
            </span>
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandEmpty>No users found.</CommandEmpty>

            <CommandGroup>
              {users.map((user) => {
                const isSelected = !!value.find((u) => u.id === user.id);

                return (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => toggleUser(user)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-20"
                      )}
                    />
                    {user.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
