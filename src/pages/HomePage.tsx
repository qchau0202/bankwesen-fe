import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const accessToken = localStorage.getItem("accessToken");

    // Check if user is logged in
    useEffect(() => {
        if (!currentUser.customerId || !accessToken) {
            toast.error("Please login first");
            navigate("/auth");
        }
    }, [currentUser.customerId, accessToken, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        navigate("/auth");
    };

    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-2">TDTU iBanking System</h1>
                    <p className="text-muted-foreground text-lg">Welcome back, {currentUser.full_name || "User"}</p>
                </div>

                {/* Balance and Account Cards Row */}
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Balance Card - Prominent Display */}
                    <Card className="border-2">
                        <CardContent className="pt-6">
                            <div>
                                <p className="text-lg text-muted-foreground mb-1">Available Balance</p>
                                <p className="text-4xl font-bold">
                                    {currentUser.balance?.toLocaleString() || "0"} VND
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info Card - Compact */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                                    <p className="text-sm font-semibold">{currentUser.customerId || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <p className="text-sm text-muted-foreground break-all">{currentUser.email || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                    <p className="text-sm text-muted-foreground">{currentUser.phone_number || "N/A"}</p>
                                </div>
                                <div className="pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="w-full font-bold text-sm"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Menu Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/tuition-payment")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Tuition Payment</CardTitle>
                                <CardDescription>
                                    Pay your tuition fees quickly and securely
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    onClick={() => navigate("/tuition-payment")}
                                    className="w-full font-bold"
                                >
                                    Make Payment
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/transaction-history")}>
                            <CardHeader>
                                <CardTitle className="text-xl">Transaction History</CardTitle>
                                <CardDescription>
                                    View your payment history and receipts
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/transaction-history")}
                                    className="w-full font-bold"
                                >
                                    View History
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;