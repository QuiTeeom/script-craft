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
	"app/backend/domain/index/entity"
	"app/backend/domain/index/service"
)

func (a *Api) GetIndexCollectionGroup() (res *entity.IndexCollectionGroup) {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		res, _ = indexService.GetIndexCollectionGroup()
	})
	return
}

func (a *Api) SaveIndexCollectionGroup(ic *entity.IndexCollectionGroup) {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		_ = indexService.SaveIndexCollectionGroup(ic)
	})
	return
}

func (a *Api) SaveIndexCollection(ic *entity.IndexCollection) *entity.IndexCollection {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		_ = indexService.SaveIndexCollection(ic)
	})
	return ic
}

func (a *Api) ListIndexCollection(ids []string) (ics []*entity.IndexCollection) {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		ics, _ = indexService.ListIndexCollection(ids)
	})
	return
}

func (a *Api) GetIndex(collectionId string) (res []*entity.Index) {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		res, _ = indexService.GetIndex(collectionId)
	})
	return
}

func (a *Api) SaveIndex(collectionId string, index []*entity.Index) {
	_ = a.container.Invoke(func(indexService service.IndexService) {
		_ = indexService.SaveIndex(collectionId, index)
	})
	return
}
