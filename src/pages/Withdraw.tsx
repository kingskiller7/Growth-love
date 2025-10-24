import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";

const supportedAssets = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.5432, minWithdraw: 0.001, fee: 0.0005 },
  { symbol: "ETH", name: "Ethereum", balance: 8.2341, minWithdraw: 0.05, fee: 0.003 },
  { symbol: "USDT", name: "Tether", balance: 6517.23, minWithdraw: 20, fee: 1 },
  { symbol: "BNB", name: "Binance Coin", balance: 42.1, minWithdraw: 0.05, fee: 0.002 },
];

export default function Withdraw() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const asset = supportedAssets.find(a => a.symbol === selectedAsset);
  const dewDeduction = amount ? (parseFloat(amount) * 43250).toFixed(2) : "0";

  const handleWithdraw = () => {
    setShowConfirmation(true);
  };

  return (
    <MainLayout showBottomNav={false}>
      <div className="container max-w-2xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Withdraw</h1>
            <p className="text-muted-foreground">Send funds to external wallet</p>
          </div>
        </div>

        {!showConfirmation ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Details</CardTitle>
                <CardDescription>Enter the details for your withdrawal</CardDescription>
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
                            <span className="text-xs text-muted-foreground ml-4">
                              Balance: {asset.balance}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination Address</Label>
                  <Input
                    placeholder="Enter wallet address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Select from address book
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Amount</Label>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => asset && setAmount(asset.balance.toString())}
                    >
                      Max: {asset?.balance}
                    </Button>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="font-mono"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => asset && setAmount((asset.balance * 0.25).toFixed(4))}
                    >
                      25%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => asset && setAmount((asset.balance * 0.50).toFixed(4))}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => asset && setAmount((asset.balance * 0.75).toFixed(4))}
                    >
                      75%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => asset && setAmount(asset.balance.toString())}
                    >
                      100%
                    </Button>
                  </div>
                </div>

                {asset && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Withdrawal Information:</p>
                        <ul className="space-y-1 mt-2">
                          <li>• Minimum withdrawal: {asset.minWithdraw} {asset.symbol}</li>
                          <li>• Network fee: {asset.fee} {asset.symbol}</li>
                          <li>• Processing time: 10-60 minutes</li>
                          <li>• Daily limit: No limit</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-mono">{amount || "0"} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span className="font-mono">{asset?.fee} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You'll Receive:</span>
                    <span className="font-mono font-semibold">
                      {amount ? (parseFloat(amount) - (asset?.fee || 0)).toFixed(4) : "0"} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">DEW Deduction:</span>
                    <span className="font-mono text-warning">{dewDeduction} DEW</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={!address || !amount || (asset && parseFloat(amount) < asset.minWithdraw)}
                >
                  Continue to Verification
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Withdrawal</CardTitle>
              <CardDescription>Please verify the details before confirming</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  Please double-check the destination address. Cryptocurrency transactions cannot be reversed.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Asset</Label>
                  <p className="font-semibold mt-1">{asset?.name} ({selectedAsset})</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination Address</Label>
                  <p className="font-mono text-sm mt-1 break-all bg-muted p-3 rounded">{address}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-mono font-semibold mt-1">{amount} {selectedAsset}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Network Fee</Label>
                  <p className="font-mono mt-1">{asset?.fee} {selectedAsset}</p>
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">You'll Receive</Label>
                  <p className="font-mono font-bold text-lg mt-1">
                    {amount ? (parseFloat(amount) - (asset?.fee || 0)).toFixed(4) : "0"} {selectedAsset}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" variant="destructive">
                  Confirm Withdrawal
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowConfirmation(false)}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
