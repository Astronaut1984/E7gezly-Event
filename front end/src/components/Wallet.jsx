import { UserContext } from "@/UserContext";
import { Wallet } from "lucide-react";
import { useContext, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DialogClose } from "@radix-ui/react-dialog";

export default function UserWallet() {
  const { user } = useContext(UserContext);

  return (
    <>
      <WalletDialog className="hover:cursor-pointer" wallet={user.wallet}>
        <Wallet className="text-primary-hover" />
      </WalletDialog>
      <h1 className="ml-2">{user.wallet} EGP</h1>
    </>
  );
}

function WalletDialog({ children, className, wallet }) {
  const [value, setValue] = useState(0);
  const { setUser } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  async function updateWallet() {}

  async function updateWallet(e) {
    e.preventDefault();
    if (!value || Number(value) <= 0) return;

    try {
      const res = await fetch("http://localhost:8000/account/editwallet/", {
        method: "PUT",
        credentials: "include", // IMPORTANT for session auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(value),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }
      setOpen(false);
      console.log(data);
      setUser((prev) => {
        return {
          ...prev,
          wallet: data.wallet,
        };
      });
    } catch (err) {
      console.error("Wallet update failed", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="caret-transparent">Wallet Info</DialogTitle>
        </DialogHeader>
        <p className="caret-transparent">Current Balance: {wallet} EGP</p>
        <div className="flex justify-between items-center gap-5">
          <Input
            value={value}
            className="caret-primary"
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
              setValue(onlyNums);
            }}
          ></Input>
          <Button
            className="select-none caret-transparent"
            onClick={updateWallet}
          >
            Charge Wallet
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="caret-transparent" variant={"outline"}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
