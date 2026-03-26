import { Repository } from "typeorm";
import { InventoryItem } from "../entity/inventory";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { ITEMS } from "@hascape/common";
import { Random } from "hcore/dist/random";

export class InventoryService {
    
    private items: Repository<InventoryItem>;
    
    constructor() {
        this.items = AppDataSource.getRepository(InventoryItem);
    }

    public async getItems(user: User) {
        return this.items.find({
            where: {
                user: {
                    id: user.id,
                }
            }
        });
    }

    public async getItem(user: User, item: string) {
        return this.items.findOne({
            where: {
                item,
                user: {
                    id: user.id,
                }
            }
        })
    }

    public async addItem(user: User, instanceId: string, item: string, quantity: number, position: number) {

        const newItem = new InventoryItem();
        newItem.instanceId = instanceId;
        newItem.item = item;
        newItem.user = user;
        newItem.quantity = quantity;
        newItem.position = position;

        await this.items.save(newItem);

        return newItem;
    }

    public async removeItem(user: User, instanceId: string) {
        const item = await this.items.findOne({
            where: {
                instanceId,
                user: {
                    id: user.id,
                }
            }
        });
        if (item) {
            await this.items.remove(item);
        }
    }
}