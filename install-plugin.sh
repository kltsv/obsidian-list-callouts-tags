#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветного текста
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo "Использование: $0 <путь_к_хранилищу_obsidian>"
    echo ""
    echo "Примеры:"
    echo "  $0 ~/Documents/MyVault"
    echo "  $0 /Users/username/Obsidian/MyNotes"
    echo ""
    echo "Скрипт установит плагин List Callouts Tags в указанное хранилище Obsidian"
    exit 1
fi

VAULT_PATH="$1"

# Проверяем что путь существует
if [ ! -d "$VAULT_PATH" ]; then
    print_error "Путь '$VAULT_PATH' не существует!"
    exit 1
fi

# Проверяем что это действительно хранилище Obsidian (есть папка .obsidian)
if [ ! -d "$VAULT_PATH/.obsidian" ]; then
    print_warning "В папке '$VAULT_PATH' не найдена папка .obsidian"
    echo "Возможно, это не хранилище Obsidian или оно еще не было открыто в Obsidian"
    echo -n "Продолжить установку? (y/N): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Установка отменена"
        exit 1
    fi
fi

# Определяем пути
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/obsidian-list-callouts-tags"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_status "Начинаем установку плагина List Callouts Tags..."
print_status "Хранилище: $VAULT_PATH"
print_status "Папка плагина: $PLUGIN_DIR"

# Создаем папку .obsidian если её нет
if [ ! -d "$VAULT_PATH/.obsidian" ]; then
    print_status "Создаем папку .obsidian..."
    mkdir -p "$VAULT_PATH/.obsidian"
fi

# Создаем папку plugins если её нет
if [ ! -d "$VAULT_PATH/.obsidian/plugins" ]; then
    print_status "Создаем папку plugins..."
    mkdir -p "$VAULT_PATH/.obsidian/plugins"
fi

# Создаем папку для плагина
print_status "Создаем папку для плагина..."
mkdir -p "$PLUGIN_DIR"

# Проверяем наличие необходимых файлов
REQUIRED_FILES=("main.js" "manifest.json" "styles.css")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    print_error "Не найдены следующие файлы:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    print_error "Убедитесь что вы запускаете скрипт из папки с собранным плагином"
    print_error "Возможно, нужно сначала выполнить: npm run build"
    exit 1
fi

# Копируем файлы
print_status "Копируем файлы плагина..."

for file in "${REQUIRED_FILES[@]}"; do
    print_status "Копируем $file..."
    cp "$SCRIPT_DIR/$file" "$PLUGIN_DIR/"
    
    if [ $? -eq 0 ]; then
        print_success "$file скопирован успешно"
    else
        print_error "Ошибка при копировании $file"
        exit 1
    fi
done

# Проверяем что файлы скопировались
print_status "Проверяем установленные файлы..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PLUGIN_DIR/$file" ]; then
        FILE_SIZE=$(stat -f%z "$PLUGIN_DIR/$file" 2>/dev/null || echo "0")
        print_success "$file установлен (размер: ${FILE_SIZE} байт)"
    else
        print_error "$file не найден после копирования!"
        exit 1
    fi
done

print_success "Плагин успешно установлен!"
echo ""
print_status "Что делать дальше:"
echo "1. Откройте или перезапустите Obsidian"
echo "2. Откройте хранилище: $VAULT_PATH"
echo "3. Перейдите в Settings → Community plugins"
echo "4. Убедитесь что Community plugins включены"
echo "5. Найдите 'List Callouts Tags' в списке и включите его"
echo ""
print_status "Как тестировать:"
echo "Создайте заметку со следующим содержимым:"
echo ""
echo "- Обычный элемент списка"
echo "- Этот элемент содержит #important информацию"
echo "- #urgent Срочное уведомление!"
echo "- #todo Добавить новые тесты"
echo ""
print_success "Готово! Удачного использования плагина!" 