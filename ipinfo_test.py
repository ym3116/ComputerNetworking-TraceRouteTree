#输入公网ip地址返回 .city, details.region, details.country
import ipinfo 

access_token = 'e284973a5f42ee'  # 免费注册获取
handler = ipinfo.getHandler(access_token)
# ip_address = "10.209.89.116"
ip_address= '202.66.60.166'
details = handler.getDetails(ip_address)
print(details)

print(details.city, details.region, details.country)
