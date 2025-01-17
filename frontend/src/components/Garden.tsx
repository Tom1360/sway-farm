import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';

import { TILES } from '../constants';
import type { ContractAbi } from '../contracts';
import type {
  IdentityInput,
  AddressInput,
  GardenVectorOutput,
} from '../contracts/ContractAbi';

import GardenTile from './GardenTile';

interface GardenProps {
  tileStates: GardenVectorOutput | undefined;
  contract: ContractAbi | null;
  setTileStates: Dispatch<SetStateAction<GardenVectorOutput | undefined>>;
  updateNum: number;
}

export default function Garden({
  tileStates,
  contract,
  setTileStates,
  updateNum,
}: GardenProps) {
  useEffect(() => {
    async function getPlantedSeeds() {
      if (contract && contract.account) {
        try {
          const address: AddressInput = {
            value: contract.account.address.toB256(),
          };
          const id: IdentityInput = { Address: address };
          const { value } = await contract.functions
            .get_garden_vec(id)
            .simulate();
          setTileStates(value);
        } catch (err) {
          console.log('Error:', err);
        }
      }
    }
    getPlantedSeeds();
  }, [contract, updateNum]);

  return (
    <>
      {TILES.map((position, index) => (
        <GardenTile
          key={index}
          position={position}
          state={tileStates ? tileStates.inner[index] : undefined}
          updateNum={updateNum}
        />
      ))}
    </>
  );
}
