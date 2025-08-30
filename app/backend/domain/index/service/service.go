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

package service

import (
	"app/backend/consts"
	"app/backend/domain/index/entity"
	"app/backend/infra/logs"
	"errors"
	"github.com/bytedance/sonic"
	"github.com/dgraph-io/badger/v4"
	nanoid "github.com/matoous/go-nanoid/v2"
	"go.uber.org/zap"
)

type IndexService interface {
	GetIndexCollectionGroup() (*entity.IndexCollectionGroup, error)
	SaveIndexCollectionGroup(ic *entity.IndexCollectionGroup) error

	SaveIndexCollection(ic *entity.IndexCollection) error
	ListIndexCollection(ids []string) ([]*entity.IndexCollection, error)

	SaveIndex(collectionId string, index []*entity.Index) error
	GetIndex(collectionId string) ([]*entity.Index, error)
}

func NewIndexService(db *badger.DB) IndexService {
	return &indexService{
		db: db,
	}
}

type indexService struct {
	db *badger.DB
}

func (i *indexService) SaveIndex(collectionId string, index []*entity.Index) error {
	_ = i.db.Update(func(txn *badger.Txn) error {
		logs.Info("保存索引", zap.Any("index", index))
		json, _ := sonic.Marshal(index)
		_ = txn.Set([]byte(consts.CollectionIndex+consts.KeySeparator+collectionId), json)
		return nil
	})
	return nil
}

func (i *indexService) GetIndex(collectionId string) ([]*entity.Index, error) {
	var index []*entity.Index
	err := i.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(consts.CollectionIndex + consts.KeySeparator + collectionId))
		if err != nil {
			if errors.Is(err, badger.ErrKeyNotFound) {
				return nil
			} else {
				logs.Error("获取索引失败", zap.Error(err))
				return consts.ErrUnknown
			}
		}
		json, _ := item.ValueCopy(nil)
		_ = sonic.Unmarshal(json, &index)
		return nil
	})
	return index, err
}

func (i *indexService) SaveIndexCollection(ic *entity.IndexCollection) error {
	_ = i.db.Update(func(txn *badger.Txn) error {
		if ic.Id == "" {
			ic.Id = nanoid.Must()
		}
		logs.Info("创建索引组", zap.Any("ic", ic))
		json, _ := sonic.Marshal(ic)
		_ = txn.Set(genIcKey(ic.Id), json)
		return nil
	})
	return nil
}

func (i *indexService) ListIndexCollection(ids []string) (ics []*entity.IndexCollection, err error) {
	var idMap map[string]bool
	if ids != nil {
		idMap = make(map[string]bool)
		for _, id := range ids {
			idMap[id] = true
		}
	}

	err = i.db.View(func(txn *badger.Txn) error {
		it := txn.NewIterator(badger.DefaultIteratorOptions)
		defer it.Close()
		prefix := []byte(consts.CollectionIndexCollection + consts.KeySeparator)
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()

			valueCopy, _ := item.ValueCopy(nil)
			var ic *entity.IndexCollection
			_ = sonic.Unmarshal(valueCopy, &ic)

			if idMap != nil {
				if _, ok := idMap[ic.Id]; !ok {
					continue
				}
			}
			ics = append(ics, ic)
		}
		return nil

	})
	return
}

func (i *indexService) GetIndexCollectionGroup() (*entity.IndexCollectionGroup, error) {
	var indexCollections *entity.IndexCollectionGroup
	err := i.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(consts.CollectionIndexCollectionGroup))
		if err != nil {
			if errors.Is(err, badger.ErrKeyNotFound) {
				indexCollections = &entity.IndexCollectionGroup{
					Opened: make([]string, 0),
					Closed: make([]string, 0),
				}
				return nil
			} else {
				logs.Error("获取目录集合失败", zap.Error(err))
				return consts.ErrUnknown
			}
		}
		json, _ := item.ValueCopy(nil)
		_ = sonic.Unmarshal(json, &indexCollections)
		return nil
	})
	return indexCollections, err
}

func (i *indexService) SaveIndexCollectionGroup(ic *entity.IndexCollectionGroup) error {
	return i.db.Update(func(txn *badger.Txn) error {
		logs.Info("保存索引分组配置", zap.Any("ic", ic))
		icsJson, _ := sonic.Marshal(ic)
		_ = txn.Set([]byte(consts.CollectionIndexCollectionGroup), icsJson)
		return nil
	})
}

func genIcKey(id string) []byte {
	return []byte(consts.CollectionIndexCollection + consts.KeySeparator + id)
}
