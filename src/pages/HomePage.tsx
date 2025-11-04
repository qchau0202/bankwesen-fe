import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        navigate("/auth");
    };

    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">iBanking System</h1>
                    <p className="text-muted-foreground">Welcome, {currentUser.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">
                        Balance: {currentUser.balance?.toLocaleString() || "0"} VND
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Main Menu</CardTitle>
                        <CardDescription>
                            Select an option to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={() => navigate("/tuition-payment")}
                            className="w-full font-bold"
                        >
                            Tuition Payment
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/transaction-history")}
                            className="w-full font-bold"
                        >
                            Transaction History
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full font-bold"
                        >
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;