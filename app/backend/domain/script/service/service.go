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
	"app/backend/domain/script/entity"
	"app/backend/infra/logs"
	"context"
	"github.com/bytedance/sonic"
	"github.com/dgraph-io/badger/v4"
	nanoid "github.com/matoous/go-nanoid/v2"
	"go.uber.org/zap"
)

func NewScriptService(db *badger.DB) ScriptService {
	return &scriptServiceImpl{
		db: db,
	}
}

type ScriptService interface {
	Save(ctx context.Context, script *entity.Script) (*entity.Script, error)
	List(ctx context.Context, ids []string) ([]*entity.Script, error)

	GetScriptContent(ctx context.Context, scriptId string) (string, error)
	SaveScriptContent(ctx context.Context, scriptId string, content string) error
}

type scriptServiceImpl struct {
	db *badger.DB
}

func (s *scriptServiceImpl) GetScriptContent(ctx context.Context, scriptId string) (res string, err error) {
	_ = s.db.Update(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(genScriptContentDbKey(scriptId)))
		if err != nil {
			res = ""
		} else {
			valueCopy, _ := item.ValueCopy(nil)
			res = string(valueCopy)
		}
		return nil
	})
	return
}

func (s *scriptServiceImpl) SaveScriptContent(ctx context.Context, scriptId string, content string) error {
	return s.db.Update(func(txn *badger.Txn) error {
		key := genScriptContentDbKey(scriptId)
		return txn.Set(key, []byte(content))
	})
}

func (s *scriptServiceImpl) Save(ctx context.Context, script *entity.Script) (res *entity.Script, err error) {
	if script.Id == "" {
		script.Id = nanoid.Must()
	}
	res = script
	logs.Info("保存脚本", zap.Any("script", script))
	_ = s.db.Update(func(txn *badger.Txn) error {
		key := genScriptDbKey(script.Id)
		json, _ := sonic.Marshal(script)
		return txn.Set(key, json)
	})
	return
}

func (s *scriptServiceImpl) List(ctx context.Context, ids []string) (res []*entity.Script, err error) {
	_ = s.db.View(func(txn *badger.Txn) error {
		for _, id := range ids {
			key := genScriptDbKey(id)
			item, err := txn.Get(key)
			if err != nil {
				continue
			}
			var script entity.Script
			valueCopy, _ := item.ValueCopy(nil)
			_ = sonic.Unmarshal(valueCopy, &script)
			res = append(res, &script)
		}
		return nil
	})
	return
}

func genScriptDbKey(id string) []byte {
	key := consts.CollectionScript + consts.KeySeparator + id
	return []byte(key)
}

func genScriptContentDbKey(id string) []byte {
	key := consts.CollectionScriptContent + consts.KeySeparator + id
	return []byte(key)
}
