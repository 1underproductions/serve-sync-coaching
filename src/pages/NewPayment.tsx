import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, DollarSign, Send, Package, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define the validation schema
const paymentFormSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  playerId: z.string().optional(),
  sessionId: z.string().optional(),
  sendEmail: z.boolean().default(false),
  paymentType: z.enum(["session", "package", "deposit", "other"]).default("session"),
  packageId: z.string().optional(),
  packageSessionCount: z.number().optional(),
  isDeposit: z.boolean().default(false),
  cancellationPolicy: z.enum(["24_hours", "48_hours", "none"]).default("24_hours"),
  expiresInHours: z.number().optional().default(48),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface Player {
  id: string;
  name: string;
  email?: string;
}

interface Session {
  id: string;
  title: string;
  playerName?: string;
  playerEmail?: string;
  playerId?: string;
  date: string;
}

interface Package {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
  discount: number;
}

const NewPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const playerId = searchParams.get("playerId");
  
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      description: "",
      playerId: playerId || "",
      sessionId: sessionId || "",
      sendEmail: true,
      paymentType: "session",
      isDeposit: false,
      cancellationPolicy: "24_hours",
      expiresInHours: 48,
    }
  });
  
  const watchPlayerId = watch("playerId");
  const watchSessionId = watch("sessionId");
  const watchSendEmail = watch("sendEmail");
  const watchPaymentType = watch("paymentType");
  const watchPackageId = watch("packageId");
  const watchIsDeposit = watch("isDeposit");
  
  // Load players, sessions and packages
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load players from localStorage
        const storedPlayers = localStorage.getItem("players");
        if (storedPlayers) {
          const parsedPlayers = JSON.parse(storedPlayers);
          setPlayers(parsedPlayers);
          
          // If playerId is provided in URL, select that player
          if (playerId) {
            const player = players.find((p: Player) => p.id === playerId);
            if (player) {
              setSelectedPlayer(player);
            }
          }
        }
        
        // Load sessions from localStorage
        const storedSessions = localStorage.getItem("sessions");
        if (storedSessions) {
          const parsedSessions = JSON.parse(storedSessions);
          setSessions(parsedSessions);
          
          // If sessionId is provided in URL, select that session
          if (sessionId) {
            const session = parsedSessions.find((s: Session) => s.id === sessionId);
            if (session) {
              setSelectedSession(session);
              setValue("description", `Tennis coaching session: ${session.title}`);
              
              // If the session has a player, select that player
              if (session.playerId && !playerId) {
                setValue("playerId", session.playerId);
                const playerFromSession = players.find((p: Player) => p.id === session.playerId);
                if (playerFromSession) {
                  setSelectedPlayer(playerFromSession);
                }
              }
            }
          }
        }
        
        // Load packages from localStorage
        const storedPackages = localStorage.getItem("packages");
        if (storedPackages) {
          const parsedPackages = JSON.parse(storedPackages);
          setPackages(parsedPackages);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load player and session data.",
        });
      }
    };
    
    loadData();
  }, [playerId, sessionId, setValue]);
  
  // Update selected player when playerId changes
  useEffect(() => {
    if (watchPlayerId) {
      const player = players.find(p => p.id === watchPlayerId);
      if (player) {
        setSelectedPlayer(player);
      } else {
        setSelectedPlayer(null);
      }
    } else {
      setSelectedPlayer(null);
    }
  }, [watchPlayerId, players]);
  
  // Update selected session when sessionId changes
  useEffect(() => {
    if (watchSessionId) {
      const session = sessions.find(s => s.id === watchSessionId);
      if (session) {
        setSelectedSession(session);
        setValue("description", `Tennis coaching session: ${session.title}`);
        
        // If the session has a player and no player is selected, select that player
        if (session.playerId && !watchPlayerId) {
          setValue("playerId", session.playerId);
        }
      } else {
        setSelectedSession(null);
      }
    } else {
      setSelectedSession(null);
    }
  }, [watchSessionId, sessions, setValue, watchPlayerId]);
  
  // Update selected package when packageId changes
  useEffect(() => {
    if (watchPackageId && watchPaymentType === "package") {
      const packageItem = packages.find(p => p.id === watchPackageId);
      if (packageItem) {
        setSelectedPackage(packageItem);
        setValue("amount", packageItem.price);
        setValue("packageSessionCount", packageItem.sessions);
        setValue("description", `Tennis coaching package: ${packageItem.name} (${packageItem.sessions} sessions)`);
      } else {
        setSelectedPackage(null);
      }
    } else {
      setSelectedPackage(null);
    }
  }, [watchPackageId, packages, watchPaymentType, setValue]);
  
  // Update form based on payment type
  useEffect(() => {
    if (watchPaymentType === "session" && selectedSession) {
      setValue("description", `Tennis coaching session: ${selectedSession.title}`);
    } else if (watchPaymentType === "package" && selectedPackage) {
      setValue("description", `Tennis coaching package: ${selectedPackage.name} (${selectedPackage.sessions} sessions)`);
    } else if (watchPaymentType === "deposit") {
      setValue("description", "Tennis coaching deposit");
      setValue("isDeposit", true);
    } else if (watchPaymentType === "other") {
      setValue("description", "Tennis coaching payment");
    }
  }, [watchPaymentType, selectedSession, selectedPackage, setValue]);
  
  const onSubmit = async (data: PaymentFormValues) => {
    setIsLoading(true);
    
    try {
      let playerEmail = "";
      
      // Get player email if a player is selected and sendEmail is true
      if (data.sendEmail && data.playerId) {
        if (selectedPlayer?.email) {
          playerEmail = selectedPlayer.email;
        } else if (selectedSession?.playerEmail) {
          playerEmail = selectedSession.playerEmail;
        }
      }
      
      // Create checkout session
      const { data: response, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          amount: data.amount,
          description: data.description,
          currency: "USD",
          successPath: "/payment-success",
          cancelPath: "/payment-canceled",
          sessionId: data.sessionId || null,
          playerId: data.playerId || null,
          playerEmail: playerEmail,
          paymentType: data.paymentType,
          sendEmail: data.sendEmail && !!playerEmail,
          packageId: data.packageId || null,
          isDeposit: data.isDeposit,
          cancellationPolicy: data.cancellationPolicy,
          expiresInHours: data.expiresInHours
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Payment link created",
        description: data.sendEmail && playerEmail 
          ? "Payment link has been created and sent to the player's email."
          : "Payment link has been created successfully.",
      });
      
      // Update session status if linked to a session
      if (data.sessionId) {
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const updatedSessions = sessions.map((s: any) => {
          if (s.id === data.sessionId) {
            return {
              ...s,
              paymentStatus: "pending",
              paymentLinkId: response.id,
              requiresPrepayment: true
            };
          }
          return s;
        });
        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
      }
      
      // Redirect to the success page
      navigate("/payment-success", { 
        state: { 
          paymentUrl: response.url,
          paymentLinkId: response.id,
          sendEmail: data.sendEmail && !!playerEmail,
          playerEmail: playerEmail
        }
      });
    } catch (error) {
      console.error("Error creating payment link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create payment link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Create Payment Link</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Create a payment link to send to your players for tennis coaching.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Payment Type */}
              <div className="space-y-3">
                <Label>Payment Type</Label>
                <Controller
                  name="paymentType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="session" id="session" />
                        <Label htmlFor="session" className="font-normal">Single Session</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="package" id="package" />
                        <Label htmlFor="package" className="font-normal">Package</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deposit" id="deposit" />
                        <Label htmlFor="deposit" className="font-normal">Deposit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal">Other</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-10"
                    placeholder="0.00"
                    {...register("amount", { valueAsNumber: true })}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount.message}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tennis lesson, 1-hour private coaching, etc."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>
              
              {/* Package Select - Only show if paymentType is package */}
              {watchPaymentType === "package" && (
                <div className="space-y-2">
                  <Label htmlFor="packageId">Package</Label>
                  <Controller
                    name="packageId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "none") field.onChange(undefined);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} - ${pkg.price} ({pkg.sessions} sessions)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
              
              {/* Player Select */}
              <div className="space-y-2">
                <Label htmlFor="playerId">Player</Label>
                <Controller
                  name="playerId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === "none") field.onChange(undefined);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a player (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} {player.email ? `(${player.email})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              {/* Session Select - Only show if paymentType is session or deposit */}
              {(watchPaymentType === "session" || watchPaymentType === "deposit") && (
                <div className="space-y-2">
                  <Label htmlFor="sessionId">
                    Session
                    {watchPaymentType === "deposit" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="ml-1 text-muted-foreground inline-flex items-center">
                              <Clock className="h-4 w-4" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Linking a session will mark it as "pending payment" and release the slot if payment is not received within the expiration time.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <Controller
                    name="sessionId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value === "none") field.onChange(undefined);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link to a session (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.title} ({new Date(session.date).toLocaleDateString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {/* Payment Options */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-medium">Payment Options</h3>
                
                <div className="space-y-4">
                  {/* Expiration Time */}
                  <div className="space-y-2">
                    <Label htmlFor="expiresInHours">Link expires after</Label>
                    <Controller
                      name="expiresInHours"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select expiration time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">3 days</SelectItem>
                            <SelectItem value="168">1 week</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Cancellation Policy */}
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                    <Controller
                      name="cancellationPolicy"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cancellation policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="24_hours">24 hours notice required</SelectItem>
                            <SelectItem value="48_hours">48 hours notice required</SelectItem>
                            <SelectItem value="none">No cancellation allowed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Send Email Option */}
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="sendEmail"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="send-email"
                    />
                  )}
                />
                <Label htmlFor="send-email">
                  Send payment link to player via email
                </Label>
              </div>
              
              {watchSendEmail && !selectedPlayer?.email && !selectedSession?.playerEmail && (
                <div className="text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
                  <p>
                    No email address found for the selected player. Please select a player with an email address or add an email to this player's profile.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-tennis-green-600 hover:bg-tennis-green-700"
              >
                {isLoading ? (
                  "Creating..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Create Payment Link
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default NewPayment;
