import HeaderBox from "@/components/HeaderBox";
import RightSIdebar from "@/components/RightSIdebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {
  const loggedin = {
    firstName: "hakim",
    lastName: "jshkm",
    email: "jshkm@contact.pro",
  };

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedin?.firstName || "guest"}
            subtext="acces and manage your account and your transactions by efecienty"
          />

          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={200000000}
          />
        </header>
        RECEMT TRANSACTIONS
      </div>

      <RightSIdebar
        user={loggedin}
        transactions={[]}
        banks={[{ currentBalance: 123000 }, { currentBalance: 923000 }]}
      />
    </section>
  );
};

export default Home;
