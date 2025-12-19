# Python Refactoring Cookbook

## Extract Function

### Before
```python
def process_order(order):
    # 검증
    if not order.items:
        raise ValueError("Empty order")
    if order.total < 0:
        raise ValueError("Invalid total")
    for item in order.items:
        if item.quantity <= 0:
            raise ValueError(f"Invalid quantity for {item.name}")
    
    # 할인 계산
    discount = 0
    if order.total > 100:
        discount = order.total * 0.1
    elif order.total > 50:
        discount = order.total * 0.05
    
    # 처리
    final_total = order.total - discount
    order.status = "processed"
    return final_total
```

### After
```python
def process_order(order):
    validate_order(order)
    discount = calculate_discount(order.total)
    return finalize_order(order, discount)

def validate_order(order):
    if not order.items:
        raise ValueError("Empty order")
    if order.total < 0:
        raise ValueError("Invalid total")
    for item in order.items:
        if item.quantity <= 0:
            raise ValueError(f"Invalid quantity for {item.name}")

def calculate_discount(total: float) -> float:
    if total > 100:
        return total * 0.1
    elif total > 50:
        return total * 0.05
    return 0

def finalize_order(order, discount: float) -> float:
    order.status = "processed"
    return order.total - discount
```

---

## Simplify Conditional

### Before
```python
def get_price(user, product):
    if user is not None:
        if user.is_premium:
            if product.on_sale:
                return product.price * 0.7
            else:
                return product.price * 0.9
        else:
            if product.on_sale:
                return product.price * 0.85
            else:
                return product.price
    else:
        return product.price
```

### After (Early Return)
```python
def get_price(user, product):
    base_price = product.price
    
    if user is None:
        return base_price
    
    sale_discount = 0.15 if product.on_sale else 0
    member_discount = 0.1 if user.is_premium else 0
    
    total_discount = sale_discount + member_discount
    return base_price * (1 - total_discount)
```

---

## Extract Constant

### Before
```python
def calculate_shipping(weight):
    if weight <= 1:
        return 5.99
    elif weight <= 5:
        return 10.99
    else:
        return 10.99 + (weight - 5) * 2.5
```

### After
```python
LIGHT_PACKAGE_RATE = 5.99
MEDIUM_PACKAGE_RATE = 10.99
HEAVY_PACKAGE_PER_KG = 2.5
MEDIUM_WEIGHT_LIMIT = 5

def calculate_shipping(weight: float) -> float:
    if weight <= 1:
        return LIGHT_PACKAGE_RATE
    elif weight <= MEDIUM_WEIGHT_LIMIT:
        return MEDIUM_PACKAGE_RATE
    else:
        extra_weight = weight - MEDIUM_WEIGHT_LIMIT
        return MEDIUM_PACKAGE_RATE + (extra_weight * HEAVY_PACKAGE_PER_KG)
```

---

## Replace Loop with Comprehension

### Before
```python
def get_active_user_emails(users):
    emails = []
    for user in users:
        if user.is_active:
            emails.append(user.email)
    return emails
```

### After
```python
def get_active_user_emails(users):
    return [user.email for user in users if user.is_active]
```

---

## Use Context Manager

### Before
```python
def read_config(path):
    f = open(path, 'r')
    try:
        data = json.load(f)
        return data
    finally:
        f.close()
```

### After
```python
def read_config(path: str) -> dict:
    with open(path, 'r') as f:
        return json.load(f)
```

---

## Parameter Object

### Before
```python
def create_user(name, email, age, country, city, zip_code, phone):
    ...
```

### After
```python
@dataclass
class Address:
    country: str
    city: str
    zip_code: str

@dataclass
class UserData:
    name: str
    email: str
    age: int
    address: Address
    phone: str

def create_user(data: UserData):
    ...
```

---

## Remove Dead Code

```python
# 탐지 방법
# 1. IDE/린터 경고 확인
# 2. 테스트 커버리지 확인
# 3. 호출 추적

# 제거 대상
- 사용되지 않는 import
- 호출되지 않는 함수
- 도달 불가능한 코드
- 주석 처리된 오래된 코드
```

---

## Checklist

- [ ] 함수가 20줄 이하인가?
- [ ] 중첩이 3단계 이하인가?
- [ ] 파라미터가 4개 이하인가?
- [ ] 매직 넘버가 없는가?
- [ ] 중복 코드가 없는가?
- [ ] 이름이 명확한가?
