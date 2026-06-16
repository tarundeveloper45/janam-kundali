import { useState, useEffect, useRef } from "react";
import { useSearchPlaces } from "@workspace/api-client-react";
import { getSearchPlacesQueryKey } from "@workspace/api-client-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceAutocompleteProps {
  value?: any;
  onChange: (place: any) => void;
  error?: string;
}

export function PlaceAutocomplete({ value, onChange, error }: PlaceAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: places = [], isLoading } = useSearchPlaces(
    { q: debouncedSearch },
    {
      query: {
        enabled: debouncedSearch.length > 2,
        queryKey: getSearchPlacesQueryKey({ q: debouncedSearch })
      }
    }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-input/50 border-border font-normal text-left h-12",
            !value?.name && "text-muted-foreground",
            error && "border-destructive focus:ring-destructive"
          )}
        >
          {value?.name ? (
            <span className="truncate">
              {value.name}, {value.state ? `${value.state}, ` : ""}{value.country}
            </span>
          ) : (
            "Search birth place..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 border-border bg-popover" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type a city name..." 
            value={search}
            onValueChange={setSearch}
            className="border-none focus:ring-0"
          />
          <CommandList>
            {debouncedSearch.length <= 2 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Type at least 3 characters to search
              </div>
            )}
            {debouncedSearch.length > 2 && isLoading && (
              <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
              </div>
            )}
            {debouncedSearch.length > 2 && !isLoading && places.length === 0 && (
              <CommandEmpty>No places found.</CommandEmpty>
            )}
            {places.length > 0 && (
              <CommandGroup>
                {places.map((place, idx) => (
                  <CommandItem
                    key={`${place.name}-${place.latitude}-${place.longitude}-${idx}`}
                    value={place.name}
                    onSelect={() => {
                      onChange(place);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-primary opacity-70" />
                    <div className="flex flex-col">
                      <span className="font-medium">{place.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {place.state ? `${place.state}, ` : ""}{place.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
