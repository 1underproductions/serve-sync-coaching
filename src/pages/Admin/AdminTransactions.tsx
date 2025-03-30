
import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, DollarSign, User, CalendarClock, CheckCircle, Clock, AlertCircle } from "lucide-react";

// Mock transaction data
const mockTransactions = [
  {
    id: "tx1",
    user: "John Doe",
    userId: "user1",
    amount: 75,
    date: "July 24, 2023",
    status: "completed",
    type: "Individual Session",
    paymentMethod: "Credit Card"
  },
  {
    id: "tx2",
    user: "Sarah Williams",
    userId: "user2",
    amount: 250,
    date: "July 22, 2023",
    status: "completed",
    type: "Monthly Subscription",
    paymentMethod: "PayPal"
  },
  {
    id: "tx3",
    user: "Michael Johnson",
    userId: "user3",
    amount: 75,
    date: "July 20, 2023",
    status: "completed",
    type: "Individual Session",
    paymentMethod: "Credit Card"
  },
  {
    id: "tx4",
    user: "David Smith",
    userId: "user4",
    amount: 150,
    date: "July 19, 2023",
    status: "pending",
    type: "Package (2 sessions)",
    paymentMethod: "Bank Transfer"
  },
  {
    id: "tx5",
    user: "Emma Brown",
    userId: "user5",
    amount: 300,
    date: "July 15, 2023",
    status: "failed",
    type: "Monthly Subscription",
    paymentMethod: "Credit Card"
  },
];

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Export CSV
              </Button>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Manual Payment
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                  <div className="col-span-3">Transaction</div>
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-12 p-4 border-t items-center"
                    >
                      <div className="col-span-3">
                        <p className="font-medium">{transaction.id}</p>
                        <p className="text-sm text-muted-foreground">{transaction.type}</p>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.user}</p>
                            <p className="text-xs text-muted-foreground">{transaction.userId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">${transaction.amount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.paymentMethod}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{transaction.date}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="flex items-center justify-end">
                          {transaction.status === "completed" ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </div>
                          ) : transaction.status === "pending" ? (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Failed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No transactions found matching your search criteria
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="pending">
              <div className="p-8 text-center text-muted-foreground">
                Pending transactions will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="failed">
              <div className="p-8 text-center text-muted-foreground">
                Failed transactions will appear here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminTransactions;
