import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info, AlertTriangle } from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useWithdraw } from "@/hooks/useWithdraw";
import { Skeleton } from "@/components/ui/skeleton";

const assetConfig: Record<string, { minWithdraw: number; fee: number; network: string }> = {
  BTC: { minWithdraw: 0.001, fee: 0.0005, network: "Bitcoin" },
  ETH: { minWithdraw: 0.01, fee: 0.003, network: "Ethereum" },
  USDT: { minWithdraw: 10, fee: 1, network: "Ethereum (ERC-20)" },
  BNB: { minWithdraw: 0.01, fee: 0.002, network: "BSC" },
  DEW: { minWithdraw: 100, fee: 0, network: "Internal" },
};

export default function Withdraw() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { holdings, loading } = usePortfolio();
  const { createWithdrawal, loading: withdrawing } = useWithdraw();

  const availableHoldings = holdings.filter(h => h.amount > 0);
  const selectedHolding = holdings.find(h => h.asset_symbol === selectedAsset);
  const config = selectedAsset ? assetConfig[selectedAsset] : null;

  useEffect(() => {
    if (availableHoldings.length > 0 && !selectedAsset) {
      setSelectedAsset(availableHoldings[0].asset_symbol);
    }
  }, [availableHoldings, selectedAsset]);

  const handleWithdraw = () => {
    setShowConfirmation(true);
  };

  const confirmWithdrawal = async () => {
    if (!selectedHolding || !config || !address || !amount) return;

    const { error } = await createWithdrawal(
      selectedAsset,
      parseFloat(amount),
      address,
      config.network,
      config.fee
    );

    if (!error) {
      navigate('/wallet');
    }
  };

  if (loading) {
    return (
      <MainLayout showBottomNav={false}>
        <div className="container max-w-2xl px-4 py-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (availableHoldings.length === 0) {
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
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No assets available for withdrawal. Add funds to your wallet first.
              </p>
              <Button className="w-full mt-4" onClick={() => navigate('/deposit')}>
                Go to Deposit
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

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
                      {availableHoldings.map((holding) => (
                        <SelectItem key={holding.asset_symbol} value={holding.asset_symbol}>
                          <div className="flex items-center justify-between w-full">
                            <span>{holding.asset_name} ({holding.asset_symbol})</span>
                            <span className="text-xs text-muted-foreground ml-4">
                              Balance: {holding.amount.toFixed(4)}
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
                      onClick={() => selectedHolding && setAmount(selectedHolding.amount.toString())}
                    >
                      Max: {selectedHolding?.amount.toFixed(4) || '0'}
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
                      onClick={() => selectedHolding && setAmount((selectedHolding.amount * 0.25).toFixed(4))}
                    >
                      25%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => selectedHolding && setAmount((selectedHolding.amount * 0.50).toFixed(4))}
                    >
                      50%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => selectedHolding && setAmount((selectedHolding.amount * 0.75).toFixed(4))}
                    >
                      75%
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => selectedHolding && setAmount(selectedHolding.amount.toString())}
                    >
                      100%
                    </Button>
                  </div>
                </div>

                {config && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Withdrawal Information:</p>
                        <ul className="space-y-1 mt-2">
                          <li>• Minimum withdrawal: {config.minWithdraw} {selectedAsset}</li>
                          <li>• Network fee: {config.fee} {selectedAsset}</li>
                          <li>• Network: {config.network}</li>
                          <li>• Processing time: 10-60 minutes</li>
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
                    <span className="font-mono">{config?.fee || 0} {selectedAsset}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You'll Receive:</span>
                    <span className="font-mono font-semibold">
                      {amount ? (parseFloat(amount) - (config?.fee || 0)).toFixed(4) : "0"} {selectedAsset}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={
                    !address || 
                    !amount || 
                    !config ||
                    !selectedHolding ||
                    parseFloat(amount) < config.minWithdraw ||
                    parseFloat(amount) > selectedHolding.amount
                  }
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
                  <p className="font-semibold mt-1">{selectedHolding?.asset_name} ({selectedAsset})</p>
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
                  <p className="font-mono mt-1">{config?.fee || 0} {selectedAsset}</p>
                </div>
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">You'll Receive</Label>
                  <p className="font-mono font-bold text-lg mt-1">
                    {amount ? (parseFloat(amount) - (config?.fee || 0)).toFixed(4) : "0"} {selectedAsset}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="destructive"
                  onClick={confirmWithdrawal}
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowConfirmation(false)}
                  disabled={withdrawing}
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
