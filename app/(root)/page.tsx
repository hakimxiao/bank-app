import HeaderBox from "@/components/HeaderBox";
import RightSIdebar from "@/components/RightSIdebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const Home = async () => {
  const loggedIn = await getLoggedInUser();

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || "guest"}
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
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 123000 }, { currentBalance: 923000 }]}
      />
    </section>
  );
};

export default Home;
