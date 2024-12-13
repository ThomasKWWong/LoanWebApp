package com.example.demo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.sql.ResultSetMetaData;
import java.util.HashMap;
import java.lang.reflect.Field;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;



@SpringBootApplication
public class DemoApplication {
    @Configuration
    public class CorsConfig implements WebMvcConfigurer {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000") // React app URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}


    public static String query_creator(ArrayList<String> filters) {
        String SQL_SELECT = "Select * from SMALL_PRELIMINARY";
        if (filters.size() != 0) {
            SQL_SELECT = SQL_SELECT + " WHERE ";
        }
        for (String filter : filters){
         SQL_SELECT = SQL_SELECT + filter + " AND ";
        }
        //Remove trailing AND
        SQL_SELECT = SQL_SELECT.substring(0, SQL_SELECT.length() - 5);
        return SQL_SELECT;
    }   

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

}

@RestController
class APIController {
    @GetMapping("/api/hello")
    public String sayHello() {
        return "Hello from Spring Boot!";
    }
    
    @GetMapping("/api/msamd")
    public List<String> getMsamdOptions() {
        String msamdQuery = "SELECT DISTINCT msamd FROM SMALL_PRELIMINARY WHERE msamd IS NOT NULL";
        return getOptions(msamdQuery);
    }

    @GetMapping("/api/county")
    public List<String> getCountyOptions() {
        String countyQuery = "SELECT DISTINCT county_name FROM SMALL_PRELIMINARY WHERE county_name IS NOT NULL";
        return getOptions(countyQuery);
    }

    private List<String> getOptions(String query) {
        List<String> options = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(
                "jdbc:postgresql://127.0.0.1:5432/postgres", "postgres", "Tkw321123$");
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet resultSet = stmt.executeQuery()) {
            while (resultSet.next()) {
                options.add(resultSet.getString(1));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error retrieving options", e);
        }
        return options;
    }

    @PostMapping("/api/filters")
    public ResponseEntity<List<String>> processFilters(@RequestBody FilterRequest filterRequest) {
        List<String> filters = filterRequest.toFilterList();
        String sqlQuery = query_creator(filters);
        System.out.println("Generated SQL Query: " + sqlQuery);
        
        try (Connection conn = DriverManager.getConnection(
                "jdbc:postgresql://127.0.0.1:5432/postgres", "postgres", "Tkw321123$")) {

            if (conn != null) {
                System.out.println("Connected to the database!");
                System.out.println(sqlQuery);
				// PreparedStatement preparedStatement = conn.prepareStatement(sqlQuery);
				// ResultSet resultSet = preparedStatement.executeQuery();
				// while (resultSet.next()){
				// 	System.out.println(resultSet.getString("RESPONDENT_ID"));
                // }
                return ResponseEntity.ok(calculatePriceAndRate(sqlQuery));
            }
            return ResponseEntity.ok(calculatePriceAndRate(sqlQuery));

        }catch (SQLException e) {
            System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
            ResponseEntity.ok("Filters processed unsuccessfully");
        } catch (Exception e) {
            e.printStackTrace();
            ResponseEntity.ok("Filters processed unsuccessfully");
        }
        return ResponseEntity.ok(calculatePriceAndRate(sqlQuery));
    }

    private String query_creator(List<String> filters) {
        String SQL_SELECT = "SELECT * FROM SMALL_PRELIMINARY";
        if (!filters.isEmpty()) {
            SQL_SELECT += " WHERE " + String.join(" AND ", filters);
        }
        return SQL_SELECT;
    }

    //calculate price and loan from filters
    private List<String> calculatePriceAndRate(String SQL_SELECT){
        //Open database connection
		try (Connection conn = DriverManager.getConnection(
            "jdbc:postgresql://127.0.0.1:5432/postgres", "postgres", "Tkw321123$")) {

        if (conn != null) {
            System.out.println("Connected to the database!");
            System.out.println(SQL_SELECT);
            PreparedStatement preparedStatement = conn.prepareStatement(SQL_SELECT);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()){
                System.out.println(resultSet.getString("RESPONDENT_ID"));
            }


            String createTemp_SQL_SELECT = "CREATE TEMPORARY TABLE temp_filtered AS " + SQL_SELECT;
            PreparedStatement stmt = conn.prepareStatement(createTemp_SQL_SELECT);
            stmt.executeUpdate();
            System.out.println("Temporary table created successfully.");
            

            String updateRates_known = "UPDATE temp_filtered SET rate_spread = (rate_spread)+2.33 WHERE rate_spread IS NOT NULL AND lien_status < 3";
            PreparedStatement update_stmt_1 = conn.prepareStatement(updateRates_known);
            int rowsUpdated = update_stmt_1.executeUpdate();
            System.out.println(rowsUpdated + " rows updated for known rates.");

            String updateRates_unknown_lien1 = "UPDATE temp_filtered SET rate_spread = 2.33+1.5 WHERE rate_spread IS NULL AND lien_status = 1";
            PreparedStatement update_stmt_2 = conn.prepareStatement(updateRates_unknown_lien1);
            int rowsUpdated_2 = update_stmt_2.executeUpdate();
            System.out.println(rowsUpdated_2 + " rows updated for unknown rates; lien_status=1.");

            String updateRates_unknown_lien2 = "UPDATE temp_filtered SET rate_spread = 2.33+3.5 WHERE rate_spread IS NULL AND lien_status = 2";
            PreparedStatement update_stmt_3 = conn.prepareStatement(updateRates_unknown_lien2);
            int rowsUpdated_3 = update_stmt_3.executeUpdate();
            System.out.println(rowsUpdated_3 + " rows updated for unknown rates; lien_status=2.");


            String getRate_Total = "SELECT (SUM(rate_spread * loan_amount_000s) / SUM(loan_amount_000s)) AS avg_rate, (SUM(loan_amount_000s)) AS total_loan_cost  FROM temp_filtered";
            PreparedStatement calc_stmt = conn.prepareStatement(getRate_Total);
            ResultSet result_calc = calc_stmt.executeQuery();
            while (result_calc.next()){
                float rate = result_calc.getFloat("avg_rate");
                int total_cost = result_calc.getInt("total_loan_cost");

                String loanAmountString = String.format("Loan Amount: $%d", total_cost * 1000);
                String interestRateString = String.format("Interest Rate: %.2f%%", rate);
                System.out.println(loanAmountString);
                System.out.println(interestRateString);

                // Return the two strings as a list
                return List.of(loanAmountString, interestRateString);
            } 

        } else {
            System.out.println("Failed to make connection!");
            return List.of("error");
        }

    } catch (SQLException e) {
        System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
        return List.of("error");
    } catch (Exception e) {
        e.printStackTrace();
        return List.of("error");
    }
    return List.of("error");
    }

    public static class FilterRequest {
        private List<String> msamd; // List of MSAMD values
        private String incomeToDebtMin;
        private String incomeToDebtMax;
        private List<String> countyName; // List of county names
        private String loanType;
        private String tractToMsamdIncomeMin;
        private String tractToMsamdIncomeMax;
        private String loanPurpose;
        private String propertyType;
        private String ownerOccupancy;
    
        // Getters and setters
        public List<String> getMsamd() {
            return msamd;
        }
    
        public void setMsamd(List<String> msamd) {
            this.msamd = msamd;
        }
    
        public void setIncomeToDebtMin(String incomeToDebtMin) {
            this.incomeToDebtMin = incomeToDebtMin;
        }
    
        public void setIncomeToDebtMax(String incomeToDebtMax) {
            this.incomeToDebtMax = incomeToDebtMax;
        }
    
        public void setCountyName(List<String> countyName) {
            this.countyName = countyName;
        }
    
        public void setLoanType(String loanType) {
            this.loanType = loanType;
        }
    
        public void setTractToMsamdIncomeMin(String tractToMsamdIncomeMin) {
            this.tractToMsamdIncomeMin = tractToMsamdIncomeMin;
        }
    
        public void setTractToMsamdIncomeMax(String tractToMsamdIncomeMax) {
            this.tractToMsamdIncomeMax = tractToMsamdIncomeMax;
        }
    
        public void setLoanPurpose(String loanPurpose) {
            this.loanPurpose = loanPurpose;
        }
    
        public void setPropertyType(String propertyType) {
            this.propertyType = propertyType;
        }

        public void setOwnerOccupancy(String ownerOccupancy) {
            this.ownerOccupancy = ownerOccupancy;
        }
    
        // Convert to a list of filters for the SQL query
        public List<String> toFilterList() {
            List<String> filters = new ArrayList<>();
    
            // Handle MSAMD (Allow multiple values)
            if (msamd != null && !msamd.isEmpty()) {
                filters.add("MSAMD IN (" + String.join(", ", msamd) + ")");
            }
    
            // Handle County Name (Allow multiple values)
            if (countyName != null && !countyName.isEmpty()) {
                filters.add("COUNTY_NAME IN ('" + String.join("', '", countyName) + "')");
            }
    
            // Handle other filters (single values for these fields)
            if (loanType != null && !loanType.isEmpty()) {
                filters.add("LOAN_TYPE = '" + loanType + "'");
            }
    
            if (loanPurpose != null && !loanPurpose.isEmpty()) {
                filters.add("LOAN_PURPOSE = '" + loanPurpose + "'");
            }
    
            if (propertyType != null && !propertyType.isEmpty()) {
                filters.add("PROPERTY_TYPE = '" + propertyType + "'");
            }
    
            if (ownerOccupancy != null && !ownerOccupancy.isEmpty()) {
                filters.add("OWNER_OCCUPANCY = '" + ownerOccupancy + "'");
            }
    
            // Handle numeric filters (income/debt ratio, etc.)
            if (tractToMsamdIncomeMin != null && !tractToMsamdIncomeMin.isEmpty()) {
                filters.add("TRACT_TO_MSAMD_INCOME > " + tractToMsamdIncomeMin);
            }
    
            if (tractToMsamdIncomeMax != null && !tractToMsamdIncomeMax.isEmpty()) {
                filters.add("TRACT_TO_MSAMD_INCOME < " + tractToMsamdIncomeMax);
            }
    
            if (incomeToDebtMin != null && !incomeToDebtMin.isEmpty()) {
                filters.add("(APPLICANT_INCOME_000S / LOAN_AMOUNT_000S) > " + incomeToDebtMin);
            }
    
            if (incomeToDebtMax != null && !incomeToDebtMax.isEmpty()) {
                filters.add("(APPLICANT_INCOME_000S / LOAN_AMOUNT_000S) < " + incomeToDebtMax);
            }

            return filters;
        }
    }
    
    
}