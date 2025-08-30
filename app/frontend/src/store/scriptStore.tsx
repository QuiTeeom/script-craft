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

import {entity} from "../../wailsjs/go/models";
import {create} from "zustand/react";
import {
    GetIndexCollectionGroup,
    GetScriptContent,
    ListIndexCollection,
    SaveIndexCollectionGroup
} from "../../wailsjs/go/api/Api";

type State = {
    activeScript: entity.Script|null
    activeScriptContext :string
}

type Action = {
    active:(script: entity.Script)=>Promise<void>
}


export const useScriptStore = create<State & Action>((set) => ({
        activeScript: null,
        activeScriptContext:"",
        active: async (script: entity.Script)=> {
            if (script.id==null){
                return
            }
            console.log("激活脚本",script)

            const content = await GetScriptContent(script.id)

            set({activeScript: script,activeScriptContext: content})
        }
    })
)
