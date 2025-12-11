const API_BASE = "http://localhost:8000";

// Типы условий хранения
export interface StorageCondition {
  id: number;
  name: string;
}

export interface StorageZone {
  id: number;
  наименование: string;          // name с бэка
  условияХранения: string;       // storage_condition с бэка (строка)
  комментарий: string;           // comment с бэка
}

export interface StorageZoneFormData {
  наименование: string;
  условияХранения: string;
  комментарий: string;
}

// Глобальный кэш для синхронизации
let storageConditionsCache: StorageCondition[] = [];
let conditionNameToIdMap: Record<string, number> = {};

// API функции
export const getStorageConditions = async (): Promise<StorageCondition[]> => {
  try {
    const res = await fetch(`${API_BASE}/storageconditions/`);
    if (!res.ok) throw new Error(`Ошибка загрузки условий хранения: ${res.status}`);
    const data = await res.json();
    
    // Обновляем кэш
    storageConditionsCache = data;
    conditionNameToIdMap = {};
    data.forEach((condition: StorageCondition) => {
      conditionNameToIdMap[condition.name] = condition.id;
    });
    
    return data;
  } catch (error) {
    console.error("Ошибка в getStorageConditions:", error);
    throw error;
  }
};

export const getStorageZones = async (): Promise<StorageZone[]> => {
  try {
    // Сначала загружаем условия хранения, если еще не загружены
    if (storageConditionsCache.length === 0) {
      await getStorageConditions();
    }

    const resZones = await fetch(`${API_BASE}/storagezones/`);
    if (!resZones.ok) throw new Error(`Ошибка загрузки зон хранения: ${resZones.status}`);
    const zonesData = await resZones.json();

    const zones = zonesData.map((z: any) => {
      // Находим имя условия хранения
      let conditionName = 'Не указано';
      
      // Проверяем разные возможные поля
      if (z.storage_condition_name) {
        conditionName = z.storage_condition_name;
      } else if (z.storage_condition) {
        conditionName = z.storage_condition;
      } else if (z.storage_condition_id && storageConditionsCache.length > 0) {
        const condition = storageConditionsCache.find(c => c.id === z.storage_condition_id);
        conditionName = condition?.name || 'Неизвестно';
      }

      return {
        id: z.id,
        наименование: z.name || '',
        условияХранения: conditionName,
        комментарий: z.comment || '',
      };
    });

    return zones;
  } catch (error) {
    console.error("Ошибка в getStorageZones:", error);
    throw error;
  }
};

export const postStorageZone = async (data: StorageZoneFormData) => {
  try {
    // Убеждаемся, что условия загружены
    if (storageConditionsCache.length === 0) {
      await getStorageConditions();
    }

    // Получаем ID условия хранения
    const conditionId = conditionNameToIdMap[data.условияХранения];
    
    if (!conditionId) {
      throw new Error(`Условие хранения "${data.условияХранения}" не найдено. Доступные: ${Object.keys(conditionNameToIdMap).join(', ')}`);
    }

    const body = {
      name: data.наименование.trim(),
      storage_condition_id: conditionId,
      comment: data.комментарий.trim(),
    };


    const res = await fetch(`${API_BASE}/storagezones/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(`Ошибка создания зоны (${res.status}): ${responseText}`);
    }

    return JSON.parse(responseText || '{}');
  } catch (error) {
    console.error("Ошибка в postStorageZone:", error);
    throw error;
  }
};

export const putStorageZone = async (id: number, data: StorageZoneFormData) => {
  try {
    // Убеждаемся, что условия загружены
    if (storageConditionsCache.length === 0) {
      await getStorageConditions();
    }

    // Получаем ID условия хранения
    const conditionId = conditionNameToIdMap[data.условияХранения];
    
    if (!conditionId) {
      throw new Error(`Условие хранения "${data.условияХранения}" не найдено. Доступные: ${Object.keys(conditionNameToIdMap).join(', ')}`);
    }

    const body = {
      name: data.наименование.trim(),
      storage_condition_id: conditionId,
      comment: data.комментарий.trim(),
    };


    // Сначала пробуем PUT
    const res = await fetch(`${API_BASE}/storagezones/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text();

    if (!res.ok) {
      if (res.status === 405) {
        const resPatch = await fetch(`${API_BASE}/storagezones/${id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(body),
        });

        const patchText = await resPatch.text();

        if (!resPatch.ok) {
          throw new Error(`Ошибка обновления зоны PATCH (${resPatch.status}): ${patchText}`);
        }

        return JSON.parse(patchText || '{}');
      }
      
      throw new Error(`Ошибка обновления зоны (${res.status}): ${responseText}`);
    }

    return JSON.parse(responseText || '{}');
  } catch (error) {
    console.error("Ошибка в putStorageZone:", error);
    throw error;
  }
};

export const deleteStorageZoneById = async (id: number) => {
  try {
    console.log(`Попытка удаления зоны с ID: ${id}`);

    const res = await fetch(`${API_BASE}/storagezones/${id}`, { 
      method: "DELETE",
      headers: { 
        "Accept": "application/json"
      }
    });

    const responseText = await res.text();
    console.log("Ответ от сервера (удаление):", res.status, responseText);

    if (!res.ok) {
      throw new Error(`Ошибка удаления зоны (${res.status}): ${responseText}`);
    }

    // Если статус 204 (No Content), возвращаем успех
    if (res.status === 204) {
      return { success: true, message: "Зона успешно удалена" };
    }

    // Если есть тело ответа, парсим его
    if (responseText) {
      return JSON.parse(responseText);
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка в deleteStorageZoneById:", error);
    throw error;
  }
};

// Конфиг для UI
export let storageConditionsConfig: Record<string, { 
  label: string; 
  icon: string; 
  description: string; 
  color: string;
}> = {};

// Функция для инициализации storageConditionsConfig
export const initStorageConditionsConfig = (conditions: StorageCondition[]) => {
  const colors = ['#e8f5e9', '#e3f2fd', '#e1f5fe', '#f3e5f5', '#fff3e0'];
  const icons = ['🏭', '🌡️', '💦', '💨', '⚠️'];

  storageConditionsConfig = {};
  conditions.forEach((c, index) => {
    storageConditionsConfig[c.name] = {
      label: c.name,
      icon: icons[index % icons.length],
      description: c.name,
      color: colors[index % colors.length],
    };
  });

  console.log("Инициализирован конфиг условий:", storageConditionsConfig);
};

// Функция для получения условий из кэша
export const getCachedConditions = (): StorageCondition[] => {
  return [...storageConditionsCache];
};