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

package api

import (
	"app/backend/domain/script/entity"
	"app/backend/domain/script/service"
)

func (a *Api) SaveScript(sc *entity.Script) (res *entity.Script) {
	_ = a.container.Invoke(func(svc service.ScriptService) error {
		e, err := svc.Save(a.ctx, sc)
		if err != nil {
			return err
		}
		res = e
		return nil
	})
	return
}

func (a *Api) ListScript(ids []string) (res []*entity.Script) {
	_ = a.container.Invoke(func(svc service.ScriptService) error {
		e, err := svc.List(a.ctx, ids)
		if err != nil {
			return err
		}
		res = e
		return nil
	})
	return
}

func (a *Api) GetScriptContent(scriptId string) (res string) {
	_ = a.container.Invoke(func(svc service.ScriptService) error {
		e, err := svc.GetScriptContent(a.ctx, scriptId)
		if err != nil {
			return err
		}
		res = e
		return nil
	})
	return
}

func (a *Api) SaveScriptContent(scriptId string, content string) (err error) {
	_ = a.container.Invoke(func(svc service.ScriptService) error {
		err = svc.SaveScriptContent(a.ctx, scriptId, content)
		if err != nil {
			return err
		}
		return nil
	})
	return
}
