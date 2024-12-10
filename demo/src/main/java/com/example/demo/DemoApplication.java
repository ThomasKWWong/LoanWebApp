package com.example.demo;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

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

        //static example for query_creator
        ArrayList<String> filters = new ArrayList<>(Arrays.asList("MSAMD = 41180", "COUNTY_CODE = 189"));
		String SQL_SELECT = query_creator(filters);

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

                    System.out.printf("Loan Amount: $%d%n", total_cost * 1000);
                    System.out.printf("Interest Rate: %.2f%%%n", rate);
                } 

          

            } else {
                System.out.println("Failed to make connection!");
            }

        } catch (SQLException e) {
            System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }

	}

}
