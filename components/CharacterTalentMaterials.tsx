import { memo } from "react";
import {
  CommonMaterial,
  ElementalStoneMaterial,
  JewelMaterial,
  LocalMaterial,
} from "genshin-data";
import clsx from "clsx";
import SimpleRarityBox from "./SimpleRarityBox";

type AscensionMaterial = {
  id: string;
  name: string;
  amount: number;
};

type TalentMaterial = {
  level: number;
  cost: number;
  items: AscensionMaterial[];
};

type Props = {
  talents: TalentMaterial[];
  materials: Record<
    string,
    CommonMaterial | ElementalStoneMaterial | LocalMaterial | JewelMaterial
  >;
};

const CharacterTalentMaterials = ({ talents, materials }: Props) => {
  return (
    <>
      {talents.map((talent, i) => (
        <div
          key={talent.level}
          className={clsx(
            "grid grid-cols-6 lg:grid-cols-10 items-center px-4",
            {
              "bg-vulcan-700": i % 2 === 0,
              "rounded rounded-b-none": i === 0,
            }
          )}
        >
          <div className="flex justify-center items-center text-sm lg:text-base">
            LV.{talent.level - 1}→{talent.level}
          </div>
          <div className="flex justify-center items-center">
            <SimpleRarityBox
              img={`/_assets/materials/mora.png`}
              name={talent.cost.toString()}
              rarity={1}
              size={16}
            />
            <p className="hidden lg:block">Mora</p>
          </div>
          <div className="lg:col-span-2 flex items-center">
            <SimpleRarityBox
              img={`/_assets/talent_lvl_up_materials/${talent.items[0].id}.png`}
              name={talent.items[0].amount.toString()}
              rarity={materials[talent.items[0].id].rarity || 1}
              size={16}
            />
            <p className="hidden lg:block">{talent.items[0].name}</p>
          </div>
          <div className="lg:col-span-2 flex items-center">
            <SimpleRarityBox
              img={`/_assets/common_materials/${talent.items[1].id}.png`}
              name={talent.items[1].amount.toString()}
              rarity={materials[talent.items[1].id]?.rarity || 1}
              size={16}
            />
            <p className="hidden lg:block">{talent.items[1].name}</p>
          </div>
          <div className="lg:col-span-2 flex items-center">
            {talent.items.length > 2 && (
              <>
                <SimpleRarityBox
                  img={`/_assets/talent_lvl_up_materials/${talent.items[2].id}.png`}
                  name={talent.items[2].amount.toString()}
                  rarity={materials[talent.items[2].id].rarity || 1}
                  size={16}
                />
                <p className="hidden lg:block">{talent.items[2].name}</p>
              </>
            )}
          </div>
          <div className="lg:col-span-2 flex items-center">
            {talent.items.length > 3 && (
              <>
                <SimpleRarityBox
                  img={`/_assets/talent_lvl_up_materials/${talent.items[3].id}.png`}
                  name={talent.items[3].amount.toString()}
                  rarity={materials[talent.items[3].id].rarity || 1}
                  size={16}
                />
                <p className="hidden lg:block">{talent.items[3].name}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default memo(CharacterTalentMaterials);
