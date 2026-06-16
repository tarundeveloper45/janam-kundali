import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import { Sparkles, Sun } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  placeObj: z.object({
    name: z.string(),
    country: z.string(),
    state: z.string().nullable().optional(),
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string(),
  }, { required_error: "Please select a birth place" })
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
    }
  });

  function onSubmit(values: FormValues) {
    const params = new URLSearchParams({
      name: values.name,
      date: values.date,
      time: values.time,
      place: values.placeObj.name,
      lat: values.placeObj.latitude.toString(),
      lng: values.placeObj.longitude.toString(),
      tz: values.placeObj.timezone,
    });
    setLocation(`/chart?${params.toString()}`);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="max-w-xl w-full space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <Sun className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-wide">Janam Kundali</h1>
          <p className="text-muted-foreground text-lg leading-relaxed font-sans">
            A Janma Kundali, or Vedic birth chart, is an ancient astrological chart mapping the precise positions of planets within zodiac signs and houses at the exact moment of your birth. Discover your cosmic blueprint.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-xl shadow-black/50">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">Enter Birth Details</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Provide exact details for the most accurate calculation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Arjun Sharma" className="bg-input/50 h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-input/50 h-12 [color-scheme:dark]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time of Birth (24hr)</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-input/50 h-12 [color-scheme:dark]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="placeObj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth</FormLabel>
                      <FormControl>
                        <PlaceAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          error={form.formState.errors.placeObj?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg font-serif tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_rgba(255,165,0,0.4)]"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  GENERATE KUNDALI
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
