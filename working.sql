select m.* 
FROM u_fws.message m inner join u_fws.target_area ta on m.target_area_code = ta.ta_code WHERE ID in 
( select distinct on (m.target_area_code) m.id from u_fws.message m order by m.target_area_code, m.message_received desc) 
and severity_value in ('1', '2', '3', '4') and ta.state = 'A';

insert into u_fws.message (target_area_code, severity, severity_value, situation, situation_changed, severity_changed, message_received)
select m.target_area_code, 'none', '5', '', NOW() at time zone 'utc', NOW() at time zone 'utc', NOW() at time zone 'utc'
FROM 
( select distinct on (m.target_area_code) m.id from u_fws.message m order by m.target_area_code, m.message_received desc) as latest
inner join u_fws.message m on m.id = latest.id
WHERE m.severity_value = '4'
AND (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM m.situation_changed)) > 86400

SELECT EXTRACT(EPOCH FROM TIMESTAMP WITH TIME ZONE '2018-12-10 13:29:00+00')
SELECT (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM TIMESTAMP WITH TIME ZONE '2019-02-12 11:41:00+00')) > 86400

select * from u_fws.message m order by m.target_area_code, m.message_received desc


insert into u_fws.message (target_area_code, severity, severity_value, situation, situation_changed, severity_changed, message_received)
values ('061WAF10Windrush', 'No longer in force', '4', 'test situation', '2019-02-12 11:00', '2019-02-12 11:00', '2019-02-12 11:00')

select * from u_fws.target_area limit 10

select TIMESTAMP WITH TIME ZONE now() at time zone 'utc'
select timezone('utc', now())
select now()::timestamp
