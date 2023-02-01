import { useState, useEffect } from "react";
import { BN } from "fuels";
import { ContractAbi } from "../contracts";
import { FoodTypeInput, IdentityInput, AddressInput } from "../contracts/ContractAbi";

interface ShowSeedsProps {
    contract: ContractAbi | null;
}

export default function ShowSeeds({ contract }: ShowSeedsProps) {
    const [seeds, setSeeds] = useState<BN>();

    useEffect(() => {
        async function getPlayer() {
            if (contract && contract.wallet) {
                try {
                    let address: AddressInput = { value: contract.wallet.address.toB256() }
                    let id: IdentityInput = { Address: address };
                    let seedType: FoodTypeInput = { tomatoes: [] };
                    let { value } = await contract.functions.get_seed_amount(id, seedType).get();
                    setSeeds(value)
                } catch (err) {
                    console.log("Error:", err)
                }
            }
        }

        getPlayer();
    }, [contract])

    return (
        <div>
            {seeds && <div>Seed Bag: {parseFloat(seeds.format()) * 1_000_000_000} seeds</div>}
        </div>
    )
}