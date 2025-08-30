/*
 *
 *  * Copyright 2025 QuiTeeom <quiteeom@gmail.com>.
 *  * Author Github: https://github.com/QuiTeeom
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     https://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import {create} from "zustand/react";
import {entity} from "../../wailsjs/go/models";
import {
    GetIndexCollectionGroup,
    ListIndexCollection,
    SaveIndexCollection,
    SaveIndexCollectionGroup,
} from "../../wailsjs/go/api/Api";
import {nanoid} from "nanoid";
import IndexCollection = entity.IndexCollection;
import IndexCollectionGroup = entity.IndexCollectionGroup;


type State = {
    openedCollections: IndexCollection[]
}

type Action = {
    loadCollectionGroup: () => void
    saveCollectionGroup: (collection: IndexCollectionGroup) => void
    saveCollection: (collection: IndexCollection) => Promise<IndexCollection>
}


export const useIndexStore = create<State & Action>((set) => ({
    openedCollections: [],
    loadCollectionGroup: async () => {
        let indexCollectionGroup = await GetIndexCollectionGroup();
        console.log('load indexCollectionGroup', indexCollectionGroup)
        let openedCs: IndexCollection[] = []
        if (indexCollectionGroup.opened){
            openedCs =await ListIndexCollection(indexCollectionGroup.opened)
            if(!openedCs){
                openedCs=[]
            }
            console.log('load opened indexCollectionGroup', openedCs)
        }

        set({openedCollections: openedCs})
    },
    saveCollectionGroup: async (collection: IndexCollectionGroup) => {
        await SaveIndexCollectionGroup(collection)
    },
    saveCollection: async (collection: IndexCollection) => {
        collection.id = nanoid()
        if (!collection.name){
            collection.name = '新键脚本簿'
        }
        const indexCollection = await SaveIndexCollection(collection);
        if (!indexCollection.id){
            return indexCollection
        }
        const indexCollectionGroup = await GetIndexCollectionGroup();

        if (!indexCollectionGroup.opened) {
            indexCollectionGroup.opened = []
        }
        indexCollectionGroup.opened.push(indexCollection.id)
        await SaveIndexCollectionGroup(indexCollectionGroup)
        return indexCollection
    }
}))
