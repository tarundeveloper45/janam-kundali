import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateKundali } from "@workspace/api-client-react";
import { KundaliGrid } from "@/components/KundaliGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, Download } from "lucide-react";

function downloadReport(name: string) {
  const reportEl = document.getElementById("kundali-report");
  if (!reportEl) return;

  // Inject a print-specific title before printing
  const style = document.createElement("style");
  style.id = "__print-override";
  style.textContent = `
    @media print {
      body > *:not(#kundali-report) { display: none !important; }
      #kundali-report { display: block !important; padding: 24px; }
    }
  `;
  document.head.appendChild(style);

  const origTitle = document.title;
  document.title = `${name}_Kundali`;
  window.print();
  document.title = origTitle;

  // Clean up after print dialog closes
  setTimeout(() => {
    const el = document.getElementById("__print-override");
    if (el) el.remove();
  }, 1000);
}

export default function Chart() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const [params, setParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setParams(new URLSearchParams(searchStr));
  }, [searchStr]);

  const { mutate: generate, data: chart, isPending, error } = useGenerateKundali();

  useEffect(() => {
    if (params && !chart && !isPending && !error) {
      const name = params.get("name");
      const date = params.get("date");
      const time = params.get("time");
      const place = params.get("place");
      const lat = params.get("lat");
      const lng = params.get("lng");
      const tz = params.get("tz");

      if (!name || !date || !time || !lat || !lng || !tz || !place) {
        setLocation("/");
        return;
      }

      generate({
        data: { name, date, time, place, latitude: parseFloat(lat), longitude: parseFloat(lng), timezone: tz }
      });
    }
  }, [params, chart, isPending, error, generate, setLocation]);

  if (isPending || !chart) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-serif text-primary animate-pulse">Calculating Cosmic Positions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-serif text-destructive mb-2">Error generating chart</h2>
        <p className="text-muted-foreground mb-6">{(error as any)?.error || "An unknown error occurred"}</p>
        <Button variant="outline" onClick={() => setLocation("/")}>Go Back</Button>
      </div>
    );
  }

  const { birthDetails, ascendant, moonSign, sunSign, nakshatra, houses, planets, yogas } = chart;
  const presentYogas = yogas.filter(y => y.isPresent);

  return (
    <div className="min-h-[100dvh] max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 pb-20">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-primary">{birthDetails.name}'s Kundali</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {birthDetails.date} at {birthDetails.time} • {birthDetails.place}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="flex-1 sm:flex-none border-primary/30 hover:bg-primary/10 text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Chart
          </Button>
          <Button
            onClick={() => downloadReport(birthDetails.name)}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white text-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* ── Printable report area ─────────────────────────────────────── */}
      <div id="kundali-report">

        {/* Print header (hidden on screen) */}
        <div className="hidden print-only mb-6 border-b pb-4">
          <h1 className="text-2xl font-serif" style={{ color: "#ff4d00" }}>{birthDetails.name}'s Janam Kundali</h1>
          <p className="text-sm text-gray-600 mt-1">
            Born: {birthDetails.date} at {birthDetails.time} • Place: {birthDetails.place}
          </p>
        </div>

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left column */}
          <div className="lg:col-span-5 space-y-6">

            {/* Kundali Chart */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-serif text-center text-primary">
                  Rasi Chart (D-1)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <KundaliGrid houses={houses} planets={planets} />
              </CardContent>
            </Card>

            {/* Birth Summary */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-serif text-primary">Birth Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: "Ascendant (Lagna)", value: ascendant.sign },
                    { label: "Moon Sign (Rashi)", value: moonSign },
                    { label: "Sun Sign", value: sunSign },
                    { label: "Nakshatra", value: `${nakshatra.name} (Pada ${nakshatra.pada})` },
                  ].map(item => (
                    <div key={item.label} className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-sm sm:text-base">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Nakshatra Details</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">Lord: {nakshatra.lord}</Badge>
                    <Badge variant="secondary" className="text-xs">Deity: {nakshatra.deity}</Badge>
                    <Badge variant="secondary" className="text-xs">Symbol: {nakshatra.symbol}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-7 space-y-6">

            {/* Planetary Positions */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-serif text-primary">Planetary Positions</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-4 sm:pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-primary text-xs sm:text-sm">Planet</TableHead>
                        <TableHead className="text-primary text-xs sm:text-sm">Sign</TableHead>
                        <TableHead className="text-primary text-xs sm:text-sm">H</TableHead>
                        <TableHead className="text-primary text-xs sm:text-sm">Deg</TableHead>
                        <TableHead className="text-primary text-xs sm:text-sm hidden sm:table-cell">Nakshatra</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planets.map((planet) => (
                        <TableRow key={planet.name} className="border-border/50 hover:bg-white/5">
                          <TableCell className="font-medium py-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base w-5 text-center">{planet.symbol}</span>
                              <span className="text-xs sm:text-sm">{planet.name}</span>
                              {planet.isRetrograde && (
                                <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-primary/50 text-primary/80">Rx</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm py-2">{planet.sign}</TableCell>
                          <TableCell className="text-xs sm:text-sm py-2">{planet.house}</TableCell>
                          <TableCell className="text-xs sm:text-sm py-2">{planet.degree.toFixed(1)}°</TableCell>
                          <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">
                            {planet.nakshatra} ({planet.nakshatraPada})
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Yogas */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-serif text-primary">Significant Yogas</CardTitle>
              </CardHeader>
              <CardContent>
                {presentYogas.length > 0 ? (
                  <div className="space-y-3">
                    {presentYogas.map((yoga, i) => (
                      <div key={i} className="p-3 sm:p-4 rounded-lg bg-black/20 border border-primary/10">
                        <h4 className="font-serif text-base sm:text-lg text-primary mb-1">{yoga.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{yoga.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-center py-6 text-sm">
                    No major yogas formed in this chart.
                  </p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Bottom download button (also appears in print footer) */}
        <div className="no-print mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={() => downloadReport(birthDetails.name)}
            className="bg-primary hover:bg-primary/90 text-white px-8"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Kundali Report (PDF)
          </Button>
        </div>

      </div>
    </div>
  );
}
