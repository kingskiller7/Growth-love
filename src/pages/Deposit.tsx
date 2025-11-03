import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Check, Info, QrCode as QrCodeIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const supportedAssets = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", minDeposit: 0.0001 },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC-20)", minDeposit: 0.01 },
  { symbol: "USDT", name: "Tether", network: "Ethereum (ERC-20)", minDeposit: 10 },
  { symbol: "BNB", name: "Binance Coin", network: "BSC (BEP-20)", minDeposit: 0.01 },
];

export default function Deposit() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [copied, setCopied] = useState(false);
  
  const depositAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
  const asset = supportedAssets.find(a => a.symbol === selectedAsset);

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout showBottomNav={false}>
      <div className="container max-w-2xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")} className="shrink-0">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Deposit</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Add funds to your wallet</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Asset</CardTitle>
            <CardDescription>Choose the cryptocurrency you want to deposit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedAssets.map((asset) => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{asset.name} ({asset.symbol})</span>
                        <span className="text-xs text-muted-foreground ml-4">{asset.network}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {asset && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Important Information:</p>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>• Minimum deposit: {asset.minDeposit} {asset.symbol}</li>
                      <li>• Network: {asset.network}</li>
                      <li>• Deposits will be automatically converted to DEW tokens</li>
                      <li>• Processing time: 10-30 minutes</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Deposit Address</CardTitle>
            <CardDescription className="text-sm">Send {selectedAsset} to this address</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex justify-center p-4 sm:p-8 bg-white rounded-lg">
              <div className="w-36 h-36 sm:w-48 sm:h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCodeIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">QR Code</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {depositAddress}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Fee:</span>
                <span className="font-mono">Variable</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DEW Conversion Rate:</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  1:1 USD
                </Badge>
              </div>
            </div>

            <Alert className="border-warning/50 bg-warning/5">
              <Info className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                Only send {selectedAsset} to this address. Sending any other asset may result in permanent loss.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent deposits
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
